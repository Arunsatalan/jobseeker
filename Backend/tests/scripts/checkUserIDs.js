const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canadajobs');
    console.log('MongoDB connected successfully\n');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const User = require('../../src/models/User');

const checkUserIDs = async () => {
  try {
    console.log('=== EMPLOYER USER DETAILS ===');
    const employers = await User.find({ role: 'employer' }).lean();
    if (employers.length > 0) {
      employers.forEach((emp, index) => {
        console.log(`${index + 1}. ID: ${emp._id}`);
        console.log(`   Name: ${emp.name || 'N/A'}`);
        console.log(`   Email: ${emp.email}`);
        console.log(`   Role: ${emp.role}`);
        console.log(`   Company Name: ${emp.companyName || 'N/A'}`);
        console.log(`   Phone: ${emp.phone || 'N/A'}`);
        console.log(`   Created: ${emp.createdAt}`);
        console.log('');
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Query error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

connectDB().then(() => {
  checkUserIDs();
});
