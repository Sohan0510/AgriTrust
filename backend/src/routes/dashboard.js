// src/routes/dashboard.js
import express from 'express';
import http from 'http';
import FarmerDayAudit from '../models/FarmerDayAudit.js';
import User from '../models/User.js';
import Reading from '../models/Reading.js';
import Device from '../models/Device.js';
import Anchor from '../models/Anchor.js';
import { computeTrustScore } from '../utils.js';
import { requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

// Get configured witness URLs from environment
const WITNESS_URLS = (process.env.WITNESS_URLS || '').split(',').map(s => s.trim()).filter(Boolean);

// Helper to check if a witness is online
async function checkWitnessOnline(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const opts = {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname || '/',
        headers: { 'Content-Type': 'application/json' },
        timeout: 2000
      };
      const req = http.request(opts, (res) => {
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.write(JSON.stringify({ dayKey: 'health-check', merkleRoot: '0'.repeat(64) }));
      req.end();
    } catch {
      resolve(false);
    }
  });
}

// Get count of active witnesses
async function getActiveWitnessCount() {
  if (WITNESS_URLS.length === 0) return 0;
  const checks = await Promise.all(WITNESS_URLS.map(url => checkWitnessOnline(url)));
  return checks.filter(online => online).length;
}

// Get trust score + day status for logged-in farmer
router.get('/me', async (req, res) => {
  const farmerId = req.user._id;
  const records = await FarmerDayAudit.find({ farmerId }).sort({ dayKey: 1 }).lean();
  const trust = computeTrustScore(records);
  res.json({ farmerId, trustScore: trust, records });
});


// Admin: list all farmers with trust score and tamper status
router.get('/farmers', requireAdmin, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('_id name email').lean();
    const out = [];
    for (const f of farmers) {
      try {
        const records = await FarmerDayAudit.find({ farmerId: f._id }).lean();
        const trust = computeTrustScore(records);
        const tamperedCount = records.filter(r => ['kept_tampered', 'global_tamper'].includes(r.status)).length;
        const lastTamper = records.find(r => ['kept_tampered', 'global_tamper'].includes(r.status));
        
        // Get readings count for this farmer
        const readingsCount = await Reading.countDocuments({ farmerId: f._id });
        const devicesCount = await Device.countDocuments({ farmerId: f._id });
        
        out.push({ 
          ...f, 
          trustScore: trust,
          tamperedCount,
          lastTamperDate: lastTamper ? lastTamper.dayKey : null,
          lastTamperType: lastTamper ? lastTamper.status : null,
          readingsCount,
          devicesCount,
          lastActive: records.length > 0 ? records[records.length - 1].updatedAt : null
        });
      } catch (farmError) {
        console.error(`Error processing farmer ${f._id}:`, farmError.message);
      }
    }
    res.json({ farmers: out });
  } catch (e) {
    console.error('Error fetching farmers:', e);
    res.status(500).json({ error: 'failed_to_fetch_farmers', details: e.message });
  }
});

// Admin: get detailed farmer information
router.get('/farmers/:farmerId', requireAdmin, async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Get farmer info
    const farmer = await User.findById(farmerId).select('name email role createdAt').lean();
    if (!farmer) return res.status(404).json({ error: 'farmer_not_found' });

    // Get farm data
    const records = await FarmerDayAudit.find({ farmerId }).sort({ dayKey: -1 }).limit(30).lean();
    const trust = computeTrustScore(records);

    // Get readings
    const readings = await Reading.find({ farmerId }).select('ts dayKey payload').sort({ ts: -1 }).limit(10).lean();

    // Get devices
    const devices = await Device.find({ farmerId }).lean();

    // Get anchors for this farmer
    const readingDayKeys = await Reading.distinct('dayKey', { farmerId });
    const anchors = await Anchor.find({ dayKey: { $in: readingDayKeys } }).lean();

    res.json({
      farmer,
      trustScore: trust,
      auditRecords: records,
      recentReadings: readings,
      devices,
      anchorsCount: anchors.length,
      readingsCount: readings.length
    });
  } catch (e) {
    console.error('Error fetching farmer details:', e);
    res.status(500).json({ error: 'failed_to_fetch_farmer_details', details: e.message });
  }
});

// Get statistics (for logged-in farmer or admin)
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const farmerId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Farmer-specific or global based on role
    const readingFilter = isAdmin ? {} : { farmerId };
    const deviceFilter = isAdmin ? {} : { farmerId };

    const totalReadings = await Reading.countDocuments(readingFilter);
    const totalDevices = await Device.countDocuments(deviceFilter);

    // Get anchors for the period
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Get all anchors in the period
    const recentAnchors = await Anchor.find({ createdAt: { $gte: periodStart } }).lean();
    
    // For farmers, get their day keys and check which have anchors
    let verifiedDays = 0;
    
    if (!isAdmin) {
      // Get days where this farmer has readings
      const farmerDayKeys = await Reading.distinct('dayKey', { farmerId });
      const farmerAnchors = recentAnchors.filter(a => farmerDayKeys.includes(a.dayKey));
      verifiedDays = farmerAnchors.filter(a => a.quorumMet).length;
    } else {
      verifiedDays = recentAnchors.filter(a => a.quorumMet).length;
    }

    // Get REAL-TIME active witness count by pinging configured witnesses
    const activeWitnesses = await getActiveWitnessCount();

    // Data integrity calculation
    const tamperedDays = recentAnchors.filter(a => a.tampered).length;
    const totalDaysWithData = recentAnchors.length || 1;
    const dataIntegrity = ((totalDaysWithData - tamperedDays) / totalDaysWithData) * 100;

    res.json({
      totalReadings,
      verifiedDays,
      activeWitnesses,
      dataIntegrity: Math.min(100, Math.max(0, dataIntegrity))
    });
  } catch (e) {
    console.error('Error fetching stats:', e);
    res.status(500).json({ error: 'failed_to_fetch_stats', details: e.message });
  }
});

// Get integrity timeline (for logged-in farmer or admin)
router.get('/integrity-timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const farmerId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get anchors in range
    const anchors = await Anchor.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ dayKey: 1 }).lean();

    // Build a map of dayKey -> anchor
    const anchorMap = new Map();
    anchors.forEach(a => anchorMap.set(a.dayKey, a));

    // For farmers, get readings per day
    const readingFilter = isAdmin ? {} : { farmerId };
    const readings = await Reading.find({
      ...readingFilter,
      ts: { $gte: startDate, $lte: endDate }
    }).lean();

    // Group readings by dayKey
    const readingsByDay = new Map();
    readings.forEach(r => {
      const key = r.dayKey;
      readingsByDay.set(key, (readingsByDay.get(key) || 0) + 1);
    });

    // Build timeline data
    const timeline = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayKey = d.toISOString().slice(0, 10);
      
      const anchor = anchorMap.get(dayKey);
      const readingsCount = readingsByDay.get(dayKey) || 0;
      
      timeline.push({
        date: dayKey,
        readings: readingsCount,
        verified: anchor ? anchor.quorumMet : (readingsCount === 0), // No readings = trivially verified
        tampered: anchor ? anchor.tampered : false,
        witnessCount: anchor?.signatures?.length || 0
      });
    }

    res.json(timeline);
  } catch (e) {
    console.error('Error fetching integrity timeline:', e);
    res.status(500).json({ error: 'failed_to_fetch_timeline', details: e.message });
  }
});

// Get recent anchors (for logged-in farmer or admin)
router.get('/recent-anchors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    const farmerId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Get recent anchors
    const anchors = await Anchor.find({})
      .sort({ createdAt: -1 })
      .limit(limit * 2) // Get more in case we need to filter
      .lean();

    // If farmer, filter to only their relevant day keys
    let filteredAnchors = anchors;
    if (!isAdmin) {
      const farmerDayKeys = await Reading.distinct('dayKey', { farmerId });
      filteredAnchors = anchors.filter(a => farmerDayKeys.includes(a.dayKey));
    }

    // Get reading counts for each anchor
    const result = await Promise.all(
      filteredAnchors.slice(0, limit).map(async (anchor) => {
        const readingFilter = isAdmin ? { dayKey: anchor.dayKey } : { dayKey: anchor.dayKey, farmerId };
        const readingsCount = await Reading.countDocuments(readingFilter);
        
        return {
          id: anchor._id,
          date: anchor.dayKey,
          merkleRoot: anchor.merkleRoot,
          readings: readingsCount,
          witnessCount: anchor.signatures?.length || 0,
          verified: anchor.quorumMet,
          tampered: anchor.tampered,
          createdAt: anchor.createdAt
        };
      })
    );

    res.json(result);
  } catch (e) {
    console.error('Error fetching recent anchors:', e);
    res.status(500).json({ error: 'failed_to_fetch_anchors', details: e.message });
  }
});

// Admin-only: get detailed stats
router.get('/admin-stats', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);

    // Total stats
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalReadings = await Reading.countDocuments({});
    const totalDevices = await Device.countDocuments({});
    const totalAnchors = await Anchor.countDocuments({});

    // Get anchors for the period
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    const recentAnchors = await Anchor.find({ createdAt: { $gte: periodStart } }).lean();
    const verifiedDays = recentAnchors.filter(a => a.quorumMet).length;
    const tamperedDays = recentAnchors.filter(a => a.tampered).length;

    // Average readings per day
    const avgReadingsPerDay = Math.round(totalReadings / days);

    // Get farmers with tamper issues
    const allAudits = await FarmerDayAudit.find({}).lean();
    const farmersWithTamper = new Set(
      allAudits.filter(a => ['kept_tampered', 'global_tamper'].includes(a.status))
        .map(a => a.farmerId.toString())
    ).size;

    res.json({
      totalFarmers,
      totalReadings,
      totalDevices,
      totalAnchors,
      verifiedDays,
      tamperedDays,
      avgReadingsPerDay,
      farmersWithTamper,
      dataIntegrity: totalReadings > 0 ? Math.round((totalReadings - (tamperedDays * 10)) / totalReadings * 100) : 100
    });
  } catch (e) {
    console.error('Error fetching admin stats:', e);
    res.status(500).json({ error: 'failed_to_fetch_stats', details: e.message });
  }
});
