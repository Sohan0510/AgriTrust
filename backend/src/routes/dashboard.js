// src/routes/dashboard.js
import express from 'express';
import FarmerDayAudit from '../models/FarmerDayAudit.js';
import User from '../models/User.js';
import Reading from '../models/Reading.js';
import Device from '../models/Device.js';
import Anchor from '../models/Anchor.js';
import { computeTrustScore } from '../utils.js';
import { requireAdmin } from '../middleware/auth.js';

export const router = express.Router();

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

// Admin: get statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);

    // Total stats
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalReadings = await Reading.countDocuments({});
    const totalDevices = await Device.countDocuments({});
    const totalAnchors = await Anchor.countDocuments({});

    // Get anchors for the period
    const now = new Date();
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
    console.error('Error fetching stats:', e);
    res.status(500).json({ error: 'failed_to_fetch_stats', details: e.message });
  }
});
