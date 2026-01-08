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
      let jobsQuery = Job.find(query)
        .populate('company', 'name logo industry size location description website socialLinks foundedYear')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      // If keyword search includes company names, we need to handle it differently
      let jobs = [];
      if (keyword) {
        // First get all jobs with populated companies
        const allJobs = await jobsQuery;
        // Filter jobs where company name matches keyword
        jobs = allJobs.filter(job =>
          job.company && job.company.name && new RegExp(keyword, 'i').test(job.company.name)
        );

        // If we don't have enough results from company name search, get additional jobs from title/description
        if (jobs.length < limit) {
          const additionalJobs = await Job.find({
            ...query,
            $or: [
              { title: new RegExp(keyword, 'i') },
              { description: new RegExp(keyword, 'i') },
            ]
          })
          .populate('company', 'name logo industry size location description website socialLinks foundedYear')
          .skip(skip)
          .limit(parseInt(limit) - jobs.length)
          .sort({ createdAt: -1 });

          jobs = [...jobs, ...additionalJobs];
        }
      } else {
        jobs = await jobsQuery;
      }

      const total = keyword ?
        await this.getTotalCountWithKeyword(query, keyword) :
        await Job.countDocuments(query);

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

  async getTotalCountWithKeyword(baseQuery, keyword) {
    try {
      // Count jobs that match the base query
      const baseCount = await Job.countDocuments(baseQuery);

      // Count jobs where company name matches keyword
      const companyJobs = await Job.find(baseQuery)
        .populate('company', 'name')
        .then(jobs => jobs.filter(job =>
          job.company && job.company.name && new RegExp(keyword, 'i').test(job.company.name)
        ));

      // Count jobs where title or description matches keyword
      const textMatchCount = await Job.countDocuments({
        ...baseQuery,
        $or: [
          { title: new RegExp(keyword, 'i') },
          { description: new RegExp(keyword, 'i') },
        ]
      });

      // Return the combined count (avoiding double counting)
      return Math.max(companyJobs.length, textMatchCount);
    } catch (error) {
      logger.error(`Failed to get total count with keyword: ${error.message}`);
      return 0;
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
