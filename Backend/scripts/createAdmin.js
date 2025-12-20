const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();
// node scripts/createAdmin.js   run code admin createAdmin.js
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canada-jobs');

    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'spyboy000008@gmail.com',
      password: 'admin123', // This will be hashed automatically by the User model
      phone: '1234567890',
      location: 'Toronto, Ontario',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
      profileCompleted: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@canadajobs.com');
      console.log('Password: admin123');
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
 

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createAdmin();