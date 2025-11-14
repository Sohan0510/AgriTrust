import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Device from './src/models/Device.js';
import Reading from './src/models/Reading.js';
import Anchor from './src/models/Anchor.js';
import FarmerDayAudit from './src/models/FarmerDayAudit.js';
import { sha256Hex, toDayKey } from './src/crypto-utils.js';

const MONGO_URI = process.env.MONGO_URI;

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing test data
    console.log('\nClearing existing test data...');
    await User.deleteMany({ email: { $in: ['farmer1@test.com', 'farmer2@test.com', 'farmer3@test.com', 'admin@test.com'] } });
    await Device.deleteMany({ label: { $regex: 'Test Device' } });
    console.log('✓ Cleared test data');

    // Create admin user
    console.log('\nCreating admin user...');
    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin'
    });
    await admin.setPassword('admin123');
    await admin.save();
    console.log('✓ Admin created:', admin._id);

    // Create 3 test farmers
    console.log('\nCreating test farmers...');
    const farmers = [];
    const farmerData = [
      { name: 'Raj Kumar', email: 'farmer1@test.com', password: 'password123' },
      { name: 'Priya Singh', email: 'farmer2@test.com', password: 'password123' },
      { name: 'Anil Patel', email: 'farmer3@test.com', password: 'password123' }
    ];

    for (const data of farmerData) {
      const farmer = new User({
        name: data.name,
        email: data.email,
        role: 'farmer'
      });
      await farmer.setPassword(data.password);
      await farmer.save();
      farmers.push(farmer);
      console.log(`  ✓ Created farmer: ${data.name} (${farmer._id})`);
    }

    // Create devices for each farmer
    console.log('\nCreating test devices...');
    const devices = [];
    for (let i = 0; i < farmers.length; i++) {
      const device = await Device.create({
        deviceId: `SENSOR-${1000 + i}`,
        farmerId: farmers[i]._id,
        label: `Test Device ${i + 1}`,
        meta: { location: `Field ${i + 1}`, model: 'DHT22' }
      });
      devices.push(device);
      console.log(`  ✓ Created device: ${device.deviceId}`);
    }

    // Create test readings (last 21 days)
    console.log('\nCreating test readings...');
    let readingCount = 0;
    const now = new Date();
    
    for (let dayOffset = 20; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dayKey = toDayKey(date);

      for (let i = 0; i < farmers.length; i++) {
        // Create 5-10 readings per farmer per day
        const readingCount_ = Math.floor(Math.random() * 6) + 5;
        for (let r = 0; r < readingCount_; r++) {
          const payload = {
            temperature: (20 + Math.random() * 15).toFixed(2),
            humidity: (40 + Math.random() * 40).toFixed(2),
            soilMoisture: (30 + Math.random() * 50).toFixed(2),
            timestamp: date.toISOString()
          };

          const canonical = JSON.stringify(payload);
          const leafHash = sha256Hex(canonical);

          await Reading.create({
            payload,
            leafHash,
            ts: date,
            dayKey,
            farmerId: farmers[i]._id,
            deviceId: devices[i].deviceId
          });
          readingCount++;
        }
      }
    }
    console.log(`✓ Created ${readingCount} readings`);

    // Create audit records
    console.log('\nCreating test audit records...');
    let auditCount = 0;
    for (let dayOffset = 20; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dayKey = toDayKey(date);

      for (let i = 0; i < farmers.length; i++) {
        const statuses = ['clean_purged', 'kept_tampered', 'pending_anchor'];
        const status = dayOffset <= 5 ? 'pending_anchor' : statuses[Math.floor(Math.random() * 3)];

        await FarmerDayAudit.create({
          farmerId: farmers[i]._id,
          dayKey,
          status,
          details: { checksum: 'test', recordsCount: Math.floor(Math.random() * 50) + 1 }
        });
        auditCount++;
      }
    }
    console.log(`✓ Created ${auditCount} audit records`);

    // Create test anchors
    console.log('\nCreating test anchors...');
    let anchorCount = 0;
    for (let dayOffset = 20; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dayKey = toDayKey(date);

      const merkleRoot = sha256Hex(`merkle-${dayKey}-${Math.random()}`);
      
      await Anchor.create({
        dayKey,
        merkleRoot,
        signatures: [
          { witness: 'witness1', signature: 'sig1_' + Math.random().toString(36).substring(7) },
          { witness: 'witness2', signature: 'sig2_' + Math.random().toString(36).substring(7) }
        ],
        quorumMet: dayOffset <= 10,
        tampered: false,
        createdAt: date
      });
      anchorCount++;
    }
    console.log(`✓ Created ${anchorCount} anchors`);

    console.log('\n✓ Test data seeded successfully!');
    console.log('\nTest credentials:');
    console.log('  Admin: admin@test.com / admin123');
    console.log('  Farmer 1: farmer1@test.com / password123');
    console.log('  Farmer 2: farmer2@test.com / password123');
    console.log('  Farmer 3: farmer3@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
