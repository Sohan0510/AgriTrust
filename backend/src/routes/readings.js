import express from 'express';
import Reading from '../models/Reading.js';

const router = express.Router();

// --- Get live readings ---
router.get('/live', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '15', 10);
    
    const readings = await Reading.find({})
      .sort({ ts: -1 })
      .limit(limit)
      .lean();

    res.json({
      readings: readings.map(r => ({
        id: r._id,
        timestamp: r.ts,
        dayKey: r.dayKey,
        farmerId: r.farmerId,
        deviceId: r.deviceId,
        payload: r.payload,
        leafHash: r.leafHash
      })),
      total: readings.length
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_live_failed' });
  }
});

// --- Get readings statistics ---
router.get('/stats', async (req, res) => {
  try {
    const total = await Reading.countDocuments({});
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const todayCount = await Reading.countDocuments({ ts: { $gte: today } });
    
    const devices = await Reading.distinct('deviceId');
    const farmers = await Reading.distinct('farmerId');

    res.json({
      totalReadings: total,
      readingsToday: todayCount,
      activeDevices: devices.length,
      activeFarmers: farmers.length,
      avgReadingsPerDay: Math.round(total / 30)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_stats_failed' });
  }
});

// --- Get sensor distribution ---
router.get('/sensor-distribution', async (req, res) => {
  try {
    const readings = await Reading.find({}).lean();
    
    const distribution = {};
    readings.forEach(r => {
      if (r.payload && r.payload.sensor) {
        distribution[r.payload.sensor] = (distribution[r.payload.sensor] || 0) + 1;
      }
    });

    const data = Object.entries(distribution).map(([sensor, count]) => ({
      sensor,
      count
    }));

    res.json({
      data,
      total: Object.values(distribution).reduce((a, b) => a + b, 0)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_distribution_failed' });
  }
});

export default router;
