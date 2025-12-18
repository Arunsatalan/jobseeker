const Job = require('../models/Job');
const logger = require('../utils/logger');

class SearchService {
  async searchJobs(filters = {}) {
    try {
      const {
        keyword = '',
        location = '',
        employmentType = [],
        experience = [],
        salaryMin = 0,
        salaryMax = 999999,
        industry = [],
        page = 1,
        limit = 10,
      } = filters;

      const query = {};

      // Keyword search
      if (keyword) {
        query.$or = [
          { title: new RegExp(keyword, 'i') },
          { description: new RegExp(keyword, 'i') },
          { company: new RegExp(keyword, 'i') },
        ];
      }

      // Location filter
      if (location) {
        query.location = new RegExp(location, 'i');
      }

      // Employment type filter
      if (employmentType.length > 0) {
        query.employmentType = { $in: employmentType };
      }

      // Experience level filter
      if (experience.length > 0) {
        query.experience = { $in: experience };
      }

      // Salary range filter
      query.salaryMin = { $gte: salaryMin };
      query.salaryMax = { $lte: salaryMax };

      // Industry filter
      if (industry.length > 0) {
        query.industry = { $in: industry };
      }

      // Status filter - only published jobs
      query.status = 'published';

      const skip = (page - 1) * limit;
      const jobs = await Job.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Job.countDocuments(query);

      logger.info(`Search executed: ${total} jobs found`);

      return {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Job search failed: ${error.message}`);
      throw error;
    }
  }

  async recommendedJobs(userId, limit = 10) {
    try {
      // Get user preferences
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user || !user.preferences) {
        return [];
      }

      const { preferences } = user;
      const query = {
        status: 'published',
      };

      if (preferences.industries?.length > 0) {
        query.industry = { $in: preferences.industries };
      }

      if (preferences.experience) {
        query.experience = preferences.experience;
      }

      if (preferences.employmentType?.length > 0) {
        query.employmentType = { $in: preferences.employmentType };
      }

      const jobs = await Job.find(query)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      return jobs;
    } catch (error) {
      logger.error(`Failed to get recommended jobs: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SearchService();
