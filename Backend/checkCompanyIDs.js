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

const Company = require('./src/models/Company');

const checkCompanyIDs = async () => {
  try {
    console.log('=== COMPANY DETAILS ===');
    const companies = await Company.find().lean();
    if (companies.length > 0) {
      companies.forEach((comp, index) => {
        console.log(`${index + 1}. ID: ${comp._id}`);
        console.log(`   Name: ${comp.name}`);
        console.log(`   Email: ${comp.email}`);
        console.log(`   Phone: ${comp.phone}`);
        console.log(`   Contact Person: ${comp.contactPerson || 'N/A'}`);
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
  checkCompanyIDs();
});
