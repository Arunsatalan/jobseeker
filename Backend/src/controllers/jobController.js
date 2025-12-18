const Job = require('../models/Job');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const searchService = require('../services/searchService');
const logger = require('../utils/logger');

// @desc Get all jobs
// @route GET /api/v1/jobs
// @access Public
exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Job.countDocuments({ status: 'published' }));

  const jobs = await Job.find({ status: 'published' })
    .populate('employer', 'firstName lastName company')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Jobs retrieved successfully', jobs, pagination);
});

// @desc Search jobs
// @route GET /api/v1/jobs/search
// @access Public
exports.searchJobs = asyncHandler(async (req, res, next) => {
  const result = await searchService.searchJobs(req.query);

  return sendPaginated(res, 200, 'Jobs found', result.jobs, result.pagination);
});

// @desc Get job by ID
// @route GET /api/v1/jobs/:id
// @access Public
exports.getJobById = asyncHandler(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $inc: { 'stats.views': 1 } },
    { new: true }
  ).populate('employer', 'firstName lastName company email');

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  return sendSuccess(res, 200, 'Job retrieved successfully', job);
});

// @desc Create job
// @route POST /api/v1/jobs
// @access Private/Employer
exports.createJob = asyncHandler(async (req, res, next) => {
  const jobData = {
    ...req.body,
    employer: req.user._id,
    status: 'draft',
  };

  const job = await Job.create(jobData);

  logger.info(`Job created: ${job._id}`);

  return sendSuccess(res, 201, 'Job created successfully', job);
});

// @desc Update job
// @route PUT /api/v1/jobs/:id
// @access Private/Employer
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  if (job.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this job');
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.info(`Job updated: ${job._id}`);

  return sendSuccess(res, 200, 'Job updated successfully', job);
});

// @desc Delete job
// @route DELETE /api/v1/jobs/:id
// @access Private/Employer or Admin
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to delete this job');
  }

  await Job.findByIdAndDelete(req.params.id);

  logger.info(`Job deleted: ${req.params.id}`);

  return sendSuccess(res, 200, 'Job deleted successfully');
});

// @desc Get employer jobs
// @route GET /api/v1/jobs/employer/jobs
// @access Private/Employer
exports.getEmployerJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Job.countDocuments({ employer: req.user._id }));

  const jobs = await Job.find({ employer: req.user._id })
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Employer jobs retrieved successfully', jobs, pagination);
});
