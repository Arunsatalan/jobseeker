const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./src/config/environment');
const Company = require('./src/models/Company');
const logger = require('./src/utils/logger');

const checkCompanies = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Get all companies
    const allCompanies = await Company.find();
    logger.info(`Total companies in database: ${allCompanies.length}`);
    
    if (allCompanies.length > 0) {
      allCompanies.forEach((company, index) => {
        logger.info(`${index + 1}. ${company.name} (Industry: ${company.industry})`);
      });
    }

    // Test regex search for vinasai
    logger.info('\nTesting search for "vinasai"...');
    const vinasaiCompanies = await Company.find({
      name: { $regex: 'vinasai', $options: 'i' }
    });
    logger.info(`Found ${vinasaiCompanies.length} companies matching "vinasai"`);
    if (vinasaiCompanies.length > 0) {
      vinasaiCompanies.forEach((company) => {
        logger.info(`- ${company.name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkCompanies();
