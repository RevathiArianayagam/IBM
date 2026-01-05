import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load env vars
dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db');
    console.log(`MongoDB Connected: ${conn.connection.host}\n`);

    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in the database.');
      console.log('Run "npm run seed:admin" to create an admin user.\n');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.membershipStatus}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }
    
    // Check for the default admin email
    const defaultAdmin = await User.findOne({ email: 'admin@library.com' });
    if (defaultAdmin) {
      console.log('✅ Default admin (admin@library.com) exists');
    } else {
      console.log('❌ Default admin (admin@library.com) does NOT exist');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking admin users:');
    console.error(error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkAdmin();

