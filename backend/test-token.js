import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import { signToken } from './src/middleware/auth.js';

const MONGO_URI = process.env.MONGO_URI;

async function testTokenAndAuth() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Get admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.log('✗ Admin not found');
      process.exit(1);
    }

    console.log('✓ Admin found:', admin.email, 'Role:', admin.role);

    // Generate token
    const token = signToken(admin);
    console.log('✓ Token generated:', token.substring(0, 50) + '...');

    // Simulate what the middleware does
    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(token, process.env.JWT_SECRET || 'dev_secret');
    console.log('✓ Token decoded:', payload);

    // Fetch the user again like the middleware does
    const verifiedUser = await User.findById(payload.uid).lean();
    console.log('✓ User from token verification:', {
      id: verifiedUser._id,
      name: verifiedUser.name,
      email: verifiedUser.email,
      role: verifiedUser.role
    });

    console.log('\nExpected request headers:');
    console.log('Authorization: Bearer ' + token);

    process.exit(0);
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
}

testTokenAndAuth();
