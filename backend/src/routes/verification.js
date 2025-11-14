import express from 'express';
import Reading from '../models/Reading.js';
import Anchor from '../models/Anchor.js';
import { canonicalStringify, sha256Hex, toDayKey } from '../crypto-utils.js';
import { buildMerkleRoot } from '../merkle.js';

const router = express.Router();

// --- Verify a reading by ID ---
router.post('/verify', async (req, res) => {
  try {
    const { readingId } = req.body;
    if (!readingId) return res.status(400).json({ error: 'readingId required' });

    const reading = await Reading.findById(readingId).lean();
    if (!reading) return res.status(404).json({ error: 'reading_not_found' });

    const dayKey = reading.dayKey;
    const anchor = await Anchor.findOne({ dayKey }).lean();
    
    if (!anchor) {
      return res.json({
        consistent: false,
        quorumMet: false,
        validSigs: 0,
        needed: 2,
        readingData: reading,
        merkleProof: [],
        merkleRoot: null,
        witnesses: [],
        verified: false,
        reason: 'no_anchor_for_day'
      });
    }

    const leaves = await Reading.find({ dayKey }).select('leafHash').lean();
    const leafHashes = leaves.map(l => l.leafHash);
    const computedRoot = buildMerkleRoot(leafHashes);

    const leafExists = leafHashes.includes(reading.leafHash);
    const rootMatches = computedRoot === anchor.merkleRoot;

    // Build merkle proof
    const merkleProof = [];
    let leafIndex = leafHashes.indexOf(reading.leafHash);
    if (leafIndex >= 0) {
      let currentLevel = leafHashes;
      let currentIndex = leafIndex;
      
      while (currentLevel.length > 1) {
        const isLeft = currentIndex % 2 === 0;
        const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
        
        if (siblingIndex < currentLevel.length) {
          merkleProof.push({
            position: isLeft ? 'right' : 'left',
            hash: currentLevel[siblingIndex]
          });
        }
        
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = currentLevel[i + 1] || left;
          const combined = sha256Hex(left + right);
          nextLevel.push(combined);
        }
        
        currentLevel = nextLevel;
        currentIndex = Math.floor(currentIndex / 2);
      }
    }

    const quorumMet = !!anchor.quorumMet;
    const validSigs = anchor.signatures?.length || 0;
    const witnesses = (anchor.signatures || []).map((sig, idx) => ({
      id: `witness_${idx}`,
      name: `Witness ${idx + 1}`,
      signature: sig.signature || sig,
      timestamp: Date.now()
    }));

    res.json({
      consistent: leafExists && rootMatches,
      quorumMet,
      validSigs,
      needed: 2,
      readingData: reading,
      merkleProof,
      merkleRoot: anchor.merkleRoot,
      witnesses,
      verified: leafExists && rootMatches && quorumMet,
      dayKey,
      computedRoot,
      rootMatches,
      leafExists
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'verify_failed' });
  }
});

// --- Admin: Verify a farmer's data window for tampering ---
router.post('/verify-farmer-window', async (req, res) => {
  try {
    const { farmerId, days = 21 } = req.body;
    if (!farmerId) return res.status(400).json({ error: 'farmerId required' });

    const results = [];
    const now = new Date();
    
    // Check last N days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = toDayKey(date);
      
      const readings = await Reading.find({ farmerId, dayKey }).select('_id leafHash payload').lean();
      if (readings.length === 0) continue;

      const anchor = await Anchor.findOne({ dayKey }).lean();
      
      if (!anchor) {
        results.push({
          dayKey,
          status: 'pending_anchor',
          verified: false,
          tampered: false,
          readingCount: readings.length
        });
        continue;
      }

      // Verify all readings for this farmer on this day
      let tamperedCount = 0;
      for (const reading of readings) {
        const leaf = sha256Hex(canonicalStringify(reading.payload));
        if (leaf !== reading.leafHash) {
          tamperedCount++;
        }
      }

      results.push({
        dayKey,
        status: tamperedCount > 0 ? 'tampered' : 'verified',
        verified: tamperedCount === 0,
        tampered: tamperedCount > 0,
        tamperedReadings: tamperedCount,
        readingCount: readings.length,
        quorumMet: anchor.quorumMet,
        witnessCount: anchor.signatures ? anchor.signatures.length : 0
      });
    }

    const verified = results.filter(r => r.verified).length;
    const tampered = results.filter(r => r.tampered).length;
    const pending = results.filter(r => r.status === 'pending_anchor').length;

    res.json({
      farmerId,
      days,
      results,
      summary: {
        verifiedDays: verified,
        tamperedDays: tampered,
        pendingDays: pending,
        totalDaysChecked: results.length,
        integrityPercentage: results.length > 0 ? Math.round((verified / results.length) * 100) : 100
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'verify_window_failed', details: e.message });
  }
});

export default router;
