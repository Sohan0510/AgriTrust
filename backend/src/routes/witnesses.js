import express from 'express';
import http from 'http';
import Anchor from '../models/Anchor.js';

const router = express.Router();

// Get configured witness URLs from environment
const WITNESS_URLS = (process.env.WITNESS_URLS || '').split(',').map(s => s.trim()).filter(Boolean);

// Helper to check if a witness is online by making a simple request
async function checkWitnessHealth(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const u = new URL(url);
      const opts = {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname || '/',
        headers: { 'Content-Type': 'application/json' },
        timeout: 3000
      };
      const req = http.request(opts, (res) => {
        const latency = Date.now() - startTime;
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ online: true, latency, publicKey: data.publicKey || null });
          } catch {
            resolve({ online: true, latency, publicKey: null });
          }
        });
      });
      req.on('error', () => resolve({ online: false, latency: 0, publicKey: null }));
      req.on('timeout', () => { req.destroy(); resolve({ online: false, latency: 0, publicKey: null }); });
      // Send a dummy request to get publicKey back
      req.write(JSON.stringify({ dayKey: 'health-check', merkleRoot: '0'.repeat(64) }));
      req.end();
    } catch {
      resolve({ online: false, latency: 0, publicKey: null });
    }
  });
}

// --- Get all witness information ---
router.get('/', async (req, res) => {
  try {
    // 1. Get signature stats from anchors
    const anchors = await Anchor.find({}).lean().limit(100);
    
    // Build a map of publicKey -> { signatureCount, lastSignature }
    const sigStats = new Map();
    anchors.forEach(anchor => {
      if (anchor.signatures && Array.isArray(anchor.signatures)) {
        anchor.signatures.forEach((sig) => {
          const pk = sig.publicKey;
          if (pk) {
            if (!sigStats.has(pk)) {
              sigStats.set(pk, { signatureCount: 0, lastSignature: null });
            }
            const s = sigStats.get(pk);
            s.signatureCount++;
            const ts = anchor.createdAt ? new Date(anchor.createdAt).toISOString() : null;
            if (!s.lastSignature || (ts && ts > s.lastSignature)) {
              s.lastSignature = ts;
            }
          }
        });
      }
    });

    // 2. Check each configured witness URL for health
    const witnessChecks = await Promise.all(
      WITNESS_URLS.map(async (url, idx) => {
        const health = await checkWitnessHealth(url);
        const stats = health.publicKey ? sigStats.get(health.publicKey) : null;
        return {
          id: `witness_${idx + 1}`,
          name: `Witness ${idx + 1}`,
          url,
          publicKey: health.publicKey,
          status: health.online ? 'active' : 'inactive',
          latency: health.latency,
          signatureCount: stats?.signatureCount || 0,
          lastSignature: stats?.lastSignature || null
        };
      })
    );

    const activeCount = witnessChecks.filter(w => w.status === 'active').length;

    res.json({
      witnesses: witnessChecks,
      totalActive: activeCount,
      totalConfigured: WITNESS_URLS.length,
      health: activeCount > 0 ? 'healthy' : 'degraded'
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
