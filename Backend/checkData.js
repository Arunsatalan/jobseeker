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
const Job = require('./src/models/Job');
const User = require('./src/models/User');

const checkData = async () => {
  try {
    console.log('=== COMPANIES COLLECTION ===');
    const companies = await Company.find().lean();
    console.log(`Total companies: ${companies.length}`);
    if (companies.length > 0) {
      companies.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.name} - ${comp.email} - ${comp.phone}`);
      });
    }

    console.log('\n=== USERS COLLECTION (Employers) ===');
    const employers = await User.find({ role: 'employer' }).lean();
    console.log(`Total employers: ${employers.length}`);
    if (employers.length > 0) {
      employers.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name || emp.email} - ${emp.email} - ${emp.role}`);
      });
    }

    console.log('\n=== JOBS COLLECTION ===');
    const jobs = await Job.find().lean();
    console.log(`Total jobs: ${jobs.length}`);
    if (jobs.length > 0) {
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} - Employer: ${job.employer} - Status: ${job.status}`);
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
  checkData();
});
