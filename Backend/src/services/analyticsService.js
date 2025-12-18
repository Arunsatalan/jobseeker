const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const logger = require('../utils/logger');

class AnalyticsService {
  async getEmployerStats(employerId) {
    try {
      const stats = {
        totalJobs: await Job.countDocuments({ employer: employerId }),
        activeJobs: await Job.countDocuments({ employer: employerId, status: 'published' }),
        totalApplications: await Application.countDocuments({ job: { $in: await Job.find({ employer: employerId }, '_id') } }),
        totalHired: await Application.countDocuments({ status: 'accepted', job: { $in: await Job.find({ employer: employerId }, '_id') } }),
      };

      const recentApplications = await Application.find()
        .populate('job')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        ...stats,
        recentApplications,
      };
    } catch (error) {
      logger.error(`Failed to get employer stats: ${error.message}`);
      throw error;
    }
  }

  async getPlatformStats() {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        totalJobSeekers: await User.countDocuments({ role: 'jobseeker' }),
        totalEmployers: await User.countDocuments({ role: 'employer' }),
        totalJobs: await Job.countDocuments(),
        totalApplications: await Application.countDocuments(),
        activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      };

      return stats;
    } catch (error) {
      logger.error(`Failed to get platform stats: ${error.message}`);
      throw error;
    }
  }

  async getJobSeekerStats(userId) {
    try {
      const stats = {
        totalApplications: await Application.countDocuments({ applicant: userId }),
        accepted: await Application.countDocuments({ applicant: userId, status: 'accepted' }),
        rejected: await Application.countDocuments({ applicant: userId, status: 'rejected' }),
        pending: await Application.countDocuments({ applicant: userId, status: 'applied' }),
        resumes: await User.findById(userId).select('resumes').then(u => u?.resumes?.length || 0),
      };

      return stats;
    } catch (error) {
      logger.error(`Failed to get job seeker stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
