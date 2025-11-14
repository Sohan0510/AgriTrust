import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import FarmerDayAudit from './src/models/FarmerDayAudit.js';
import Reading from './src/models/Reading.js';
import Device from './src/models/Device.js';
import Anchor from './src/models/Anchor.js';
import { computeTrustScore } from './src/utils.js';

const MONGO_URI = process.env.MONGO_URI;

async function testApi() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected\n');

    // Check farmers exist
    const farmers = await User.find({ role: 'farmer' }).select('_id name email').lean();
    console.log(`Total farmers: ${farmers.length}`);
    
    if (farmers.length === 0) {
      console.log('No farmers found! Exiting.');
      process.exit(1);
    }

    console.log('\nFarmers:');
    for (const f of farmers) {
      console.log(`  - ${f.name} (${f.email}): ${f._id}`);
    }

    // Simulate the API response
    console.log('\n--- Simulating /api/dashboard/farmers response ---\n');
    const out = [];
    for (const f of farmers) {
      const records = await FarmerDayAudit.find({ farmerId: f._id }).lean();
      const trust = computeTrustScore(records);
      const tamperedCount = records.filter(r => ['kept_tampered', 'global_tamper'].includes(r.status)).length;
      const lastTamper = records.find(r => ['kept_tampered', 'global_tamper'].includes(r.status));
      
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
    }

    console.log(JSON.stringify({ farmers: out }, null, 2));

    // Check stats
    console.log('\n--- Simulating /api/dashboard/stats response ---\n');
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalReadings = await Reading.countDocuments({});
    const totalDevices = await Device.countDocuments({});
    const totalAnchors = await Anchor.countDocuments({});

    console.log(JSON.stringify({
      totalFarmers,
      totalReadings,
      totalDevices,
      totalAnchors
    }, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

testApi();
