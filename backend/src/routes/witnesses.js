import express from 'express';
import Anchor from '../models/Anchor.js';

const router = express.Router();

// --- Get all witness information ---
router.get('/', async (req, res) => {
  try {
    const anchors = await Anchor.find({}).lean().limit(30);
    
    // Extract unique witnesses from signatures
    const witnessMap = new Map();
    
    anchors.forEach(anchor => {
      if (anchor.signatures && Array.isArray(anchor.signatures)) {
        anchor.signatures.forEach((sig, idx) => {
          const witnessId = `witness_${sig.publicKey || idx}`;
          if (!witnessMap.has(witnessId)) {
            witnessMap.set(witnessId, {
              id: witnessId,
              name: `Witness ${idx + 1}`,
              publicKey: sig.publicKey,
              status: 'active',
              signatureCount: 0,
              lastSignature: null
            });
          }
          const w = witnessMap.get(witnessId);
          w.signatureCount++;
          w.lastSignature = new Date(anchor.createdAt || Date.now()).toISOString();
        });
      }
    });

    const witnesses = Array.from(witnessMap.values());

    res.json({
      witnesses,
      totalActive: witnesses.length,
      health: 'healthy'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_witnesses_failed' });
  }
});

// --- Get specific witness details ---
router.get('/:witnessId', async (req, res) => {
  try {
    const { witnessId } = req.params;
    
    const anchors = await Anchor.find({}).lean().limit(100);
    
    let signatures = [];
    anchors.forEach(anchor => {
      if (anchor.signatures && Array.isArray(anchor.signatures)) {
        anchor.signatures.forEach((sig) => {
          if (sig.publicKey === witnessId || sig.publicKey?.includes(witnessId)) {
            signatures.push({
              dayKey: anchor.dayKey,
              merkleRoot: anchor.merkleRoot,
              signature: sig.signature,
              timestamp: anchor.createdAt || new Date()
            });
          }
        });
      }
    });

    res.json({
      id: witnessId,
      name: `Witness ${witnessId}`,
      status: signatures.length > 0 ? 'active' : 'inactive',
      totalSignatures: signatures.length,
      recentSignatures: signatures.slice(0, 10)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_witness_failed' });
  }
});

// --- Get recent signatures ---
router.get('/signatures/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    
    const anchors = await Anchor.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const signatures = [];
    anchors.forEach(anchor => {
      if (anchor.signatures && Array.isArray(anchor.signatures)) {
        anchor.signatures.forEach((sig, idx) => {
          signatures.push({
            id: `${anchor.dayKey}_${idx}`,
            dayKey: anchor.dayKey,
            witnessId: `witness_${sig.publicKey || idx}`,
            signature: sig.signature,
            merkleRoot: anchor.merkleRoot,
            timestamp: anchor.createdAt || new Date(),
            quorumMet: anchor.quorumMet
          });
        });
      }
    });

    res.json({
      signatures: signatures.slice(0, limit),
      total: signatures.length
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_signatures_failed' });
  }
});

export default router;
