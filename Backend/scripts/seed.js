const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const config = require('../src/config/environment');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Company = require('../src/models/Company');
const Category = require('../src/models/Category');
const logger = require('../src/utils/logger');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await Category.deleteMany({});

    logger.info('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@findjob.com',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      isEmailVerified: true,
    });

    logger.info('Created admin user');

    // Create sample categories
    const categories = await Category.create([
      { name: 'Technology', description: 'Software, IT, and tech-related jobs', createdBy: admin._id },
      { name: 'Healthcare', description: 'Medical, nursing, and healthcare positions', createdBy: admin._id },
      { name: 'Finance', description: 'Banking, accounting, and financial services', createdBy: admin._id },
      { name: 'Marketing', description: 'Marketing, advertising, and brand management', createdBy: admin._id },
      { name: 'Education', description: 'Teaching, training, and educational roles', createdBy: admin._id },
      { name: 'Manufacturing', description: 'Production, engineering, and manufacturing jobs', createdBy: admin._id },
      { name: 'Retail', description: 'Sales, customer service, and retail positions', createdBy: admin._id },
      { name: 'Construction', description: 'Building, architecture, and construction work', createdBy: admin._id },
      { name: 'Legal', description: 'Law, legal services, and compliance roles', createdBy: admin._id },
      { name: 'Design', description: 'Graphic design, UX/UI, and creative positions', createdBy: admin._id },
      { name: 'Data Science', description: 'Data analysis, machine learning, and analytics', createdBy: admin._id },
      { name: 'Human Resources', description: 'HR, recruitment, and people management', createdBy: admin._id },
    ]);

    logger.info(`Created ${categories.length} categories`);

    // Create sample companies
    const companies = await Company.create([
      {
        name: 'Tech Corp',
        industry: 'Technology',
        size: 'large',
        location: 'Toronto, ON',
        website: 'https://techcorp.com',
        description: 'Leading technology company',
      },
      {
        name: 'Finance Plus',
        industry: 'Finance',
        size: 'large',
        location: 'Vancouver, BC',
        website: 'https://financeplus.com',
        description: 'Financial services provider',
      },
    ]);

    logger.info(`Created ${companies.length} companies`);

    // Create sample job seekers
    const jobSeekers = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'jobseeker',
        location: 'Toronto, ON',
        phone: '416-123-4567',
        isEmailVerified: true,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'jobseeker',
        location: 'Vancouver, BC',
        phone: '604-123-4567',
        isEmailVerified: true,
      },
    ]);

    logger.info(`Created ${jobSeekers.length} job seekers`);

    // Create sample employers
    const employers = await User.create([
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@techcorp.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'employer',
        company: companies[0]._id,
        isEmailVerified: true,
      },
      {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice@financeplus.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'employer',
        company: companies[1]._id,
        isEmailVerified: true,
      },
    ]);

    logger.info(`Created ${employers.length} employers`);

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Senior Software Engineer',
        description: 'Looking for experienced software engineer',
        company: 'Tech Corp',
        employer: employers[0]._id,
        location: 'Toronto, ON',
        employmentType: 'full-time',
        experience: 'senior',
        salaryMin: 100000,
        salaryMax: 150000,
        skills: ['JavaScript', 'React', 'Node.js'],
        industry: 'Technology',
        category: 'Technology',
        status: 'published',
      },
      {
        title: 'Financial Analyst',
        description: 'Join our finance team',
        company: 'Finance Plus',
        employer: employers[1]._id,
        location: 'Vancouver, BC',
        employmentType: 'full-time',
        experience: 'mid',
        salaryMin: 70000,
        salaryMax: 90000,
        skills: ['Excel', 'Financial Analysis', 'SQL'],
        industry: 'Finance',
        category: 'Finance',
        status: 'published',
      },
    ]);

    logger.info(`Created ${jobs.length} jobs`);

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
