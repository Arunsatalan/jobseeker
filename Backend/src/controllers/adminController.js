const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const AdminLog = require('../models/AdminLog');
const analyticsService = require('../services/analyticsService');
const notificationService = require('../services/notificationService');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const constants = require('../utils/constants');

// @desc Get dashboard stats
// @route GET /api/v1/admin/dashboard
// @access Private/Admin
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const stats = await analyticsService.getPlatformStats();

  return sendSuccess(res, 200, 'Dashboard stats retrieved', stats);
});

// @desc Get platform stats
// @route GET /api/v1/admin/stats
// @access Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const stats = await analyticsService.getPlatformStats();

  return sendSuccess(res, 200, 'Platform stats retrieved', stats);
});

// @desc Get all users
// @route GET /api/v1/admin/users
// @access Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;

  const pagination = helpers.getPaginationData(page, limit, await User.countDocuments(query));

  // Get users with resume counts using aggregation
  const usersWithResumeCounts = await User.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'resumes',
        localField: '_id',
        foreignField: 'user',
        as: 'resumes'
      }
    },
    {
      $addFields: {
        resumeCount: { $size: '$resumes' }
      }
    },
    {
      $project: {
        password: 0,
        resumes: 0 // Don't include the full resumes array
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: pagination.startIndex },
    { $limit: pagination.limit }
  ]);

  return sendPaginated(res, 200, 'Users retrieved', usersWithResumeCounts, pagination);
});

// @desc Update user status
// @route PUT /api/v1/admin/users/:id/status
// @access Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status, reason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'user_suspended',
    targetUser: req.params.id,
    reason,
  });

  logger.info(`User status updated: ${req.params.id}`);

  return sendSuccess(res, 200, 'User status updated', user);
});

// @desc Delete user
// @route DELETE /api/v1/admin/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'user_deleted',
    targetUser: req.params.id,
    reason,
  });

  logger.info(`User deleted by admin: ${req.params.id}`);

  return sendSuccess(res, 200, 'User deleted successfully');
});

// @desc Get all jobs
// @route GET /api/v1/admin/jobs
// @access Private/Admin
exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const pagination = helpers.getPaginationData(page, limit, await Job.countDocuments(query));

  const jobs = await Job.find(query)
    .populate('employer', 'firstName lastName')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Jobs retrieved', jobs, pagination);
});

// @desc Delete job
// @route DELETE /api/v1/admin/jobs/:id
// @access Private/Admin
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  // Send notification to the employer (company)
  try {
    await notificationService.createNotification(
      job.employer,
      'job_deleted',
      'Job Removed by Admin',
      `Your job "${job.title}" has been removed by an administrator. ${reason ? `Reason: ${reason}` : ''}`,
      {
        jobId: job._id,
        jobTitle: job.title,
        reason: reason || 'Administrative action',
        deletedBy: req.user._id,
        deletedAt: new Date(),
      }
    );
  } catch (notificationError) {
    logger.error(`Failed to send notification to employer: ${notificationError.message}`);
  }

  // Send notification to admin (confirmation)
  try {
    await notificationService.createNotification(
      req.user._id,
      'job_deleted_admin',
      'Job Deletion Completed',
      `You have successfully deleted the job "${job.title}" posted by ${job.company}.`,
      {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        employerId: job.employer,
        reason: reason || 'Administrative action',
        deletedAt: new Date(),
      }
    );
  } catch (notificationError) {
    logger.error(`Failed to send notification to admin: ${notificationError.message}`);
  }

  // Log admin action
  await AdminLog.create({
    admin: req.user._id,
    action: 'job_removed',
    targetJob: req.params.id,
    reason,
  });

  logger.info(`Job deleted by admin: ${req.params.id}`);

  return sendSuccess(res, 200, 'Job deleted successfully');
});

// @desc Update job status
// @route PUT /api/v1/admin/jobs/:id/status
// @access Private/Admin
exports.updateJobStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  logger.info(`Job status updated: ${req.params.id}`);

  return sendSuccess(res, 200, 'Job status updated', job);
});

// @desc Get reports
// @route GET /api/v1/admin/reports
// @access Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  // This would integrate with a Report model
  return sendSuccess(res, 200, 'Reports retrieved', []);
});

// @desc Resolve report
// @route PUT /api/v1/admin/reports/:id/resolve
// @access Private/Admin
exports.resolveReport = asyncHandler(async (req, res, next) => {
  // This would update report status

  logger.info(`Report resolved: ${req.params.id}`);

  return sendSuccess(res, 200, 'Report resolved successfully');
});

// @desc Get settings
// @route GET /api/v1/admin/settings
// @access Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
  // This would retrieve system settings from database or cache

  return sendSuccess(res, 200, 'Settings retrieved', {});
});

// @desc Update settings
// @route PUT /api/v1/admin/settings
// @access Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // This would update system settings

  logger.info(`Settings updated by admin: ${req.user._id}`);

  return sendSuccess(res, 200, 'Settings updated successfully');
});
