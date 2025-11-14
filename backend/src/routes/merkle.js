import express from 'express';
import Reading from '../models/Reading.js';
import Anchor from '../models/Anchor.js';
import { sha256Hex } from '../crypto-utils.js';
import { buildMerkleRoot } from '../merkle.js';

const router = express.Router();

// --- Get Merkle tree for a specific date or today ---
router.get('/tree', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const readings = await Reading.find({ dayKey: date }).select('leafHash').lean();
    
    if (readings.length === 0) {
      return res.json({
        date,
        root: null,
        leaves: [],
        tree: [],
        hasAnchor: false
      });
    }

    const leaves = readings.map(r => r.leafHash);
    const root = buildMerkleRoot(leaves);

    // Build tree structure
    const tree = buildTreeStructure(leaves);
    
    const anchor = await Anchor.findOne({ dayKey: date }).lean();

    res.json({
      date,
      root,
      leaves,
      tree,
      hasAnchor: !!anchor,
      anchor: anchor ? {
        merkleRoot: anchor.merkleRoot,
        quorumMet: anchor.quorumMet,
        signatureCount: anchor.signatures?.length || 0
      } : null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_tree_failed' });
  }
});

// --- Get details for a specific node ---
router.get('/node/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    // Find reading with this leafHash
    const reading = await Reading.findOne({ leafHash: nodeId }).lean();
    
    if (!reading) {
      return res.status(404).json({ error: 'node_not_found' });
    }

    res.json({
      nodeId,
      reading,
      dayKey: reading.dayKey
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_node_failed' });
  }
});

function buildTreeStructure(leaves) {
  const tree = [];
  let currentLevel = leaves.map((leaf, idx) => ({
    hash: leaf,
    index: idx,
    level: 0,
    isLeaf: true
  }));

  tree.push([...currentLevel]);
  let level = 1;

  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left;
      const combined = sha256Hex(left.hash + right.hash);
      
      nextLevel.push({
        hash: combined,
        left: left.hash,
        right: right.hash,
        level,
        isLeaf: false
      });
    }
    tree.push(nextLevel);
    currentLevel = nextLevel;
    level++;
  }

  return tree;
}

export default router;
