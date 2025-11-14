import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const MONGO_URI = process.env.MONGO_URI;

async function checkAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (admin) {
      console.log('✓ Admin found:');
      console.log('  ID:', admin._id);
      console.log('  Name:', admin.name);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
    } else {
      console.log('✗ Admin not found');
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkAdmin();
