import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import { signToken } from './src/middleware/auth.js';
import http from 'http';

const MONGO_URI = process.env.MONGO_URI;

async function testApiEndpoint() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Get admin user and generate token
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) throw new Error('Admin not found');
    
    const token = signToken(admin);
    console.log('✓ Generated admin token\n');

    // Make HTTP request to /api/dashboard/farmers
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/farmers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('📤 Making request to GET /api/dashboard/farmers');
    console.log('   With admin token for:', admin.email, '\n');

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('📥 Response status:', res.statusCode);
          console.log('📥 Response headers:', res.headers);
          console.log('\n📥 Response body:\n');
          try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log(data);
          }
          resolve(null);
        });
      });

      req.on('error', reject);
      req.end();
    });

  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
}

testApiEndpoint().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
