import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load env vars
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@library.com' });
    
    if (adminExists) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('📧 Email: admin@library.com');
      console.log('👤 Role:', adminExists.role);
      console.log('\nIf you want to reset the password, delete the user first or use a different email.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@library.com',
      password: 'admin123', // Change this password after first login!
      role: 'admin',
      membershipStatus: 'active'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('📧 Email: admin@library.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    console.error(error.message);
    if (error.code === 11000) {
      console.error('\nA user with this email already exists.');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();

