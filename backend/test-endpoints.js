import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

function httpGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    // Connect to MongoDB to get a test user
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.error('Admin user not found. Run seed-data.js first');
      process.exit(1);
    }

    // Generate token manually - must use 'uid' not 'id'
    const token = jwt.sign(
      { uid: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Generated token for admin user');

    // Test endpoints
    console.log('\n=== Testing API Endpoints ===\n');

    try {
      console.log('Testing /api/witnesses');
      const result = await httpGet('/api/witnesses', token);
      console.log('✓ Status:', result.status);
      console.log('Response:', JSON.stringify(result.body, null, 2));
    } catch (e) {
      console.error('✗ Witnesses failed:', e.message);
    }

    try {
      console.log('\nTesting /api/readings/live');
      const result = await httpGet('/api/readings/live', token);
      console.log('✓ Status:', result.status);
      console.log('Response:', JSON.stringify(result.body, null, 2));
    } catch (e) {
      console.error('✗ Readings failed:', e.message);
    }

    try {
      console.log('\nTesting /api/readings/stats');
      const result = await httpGet('/api/readings/stats', token);
      console.log('✓ Status:', result.status);
      console.log('Response:', JSON.stringify(result.body, null, 2));
    } catch (e) {
      console.error('✗ Stats failed:', e.message);
    }

    try {
      console.log('\nTesting /api/analytics/monthly');
      const result = await httpGet('/api/analytics/monthly', token);
      console.log('✓ Status:', result.status);
      console.log('Response:', JSON.stringify(result.body, null, 2));
    } catch (e) {
      console.error('✗ Monthly failed:', e.message);
    }

    console.log('\n=== All tests complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
