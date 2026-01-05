const Job = require('../models/Job');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const searchService = require('../services/searchService');
const logger = require('../utils/logger');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// @desc Get all jobs
// @route GET /api/v1/jobs
// @access Public
exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Job.countDocuments({ status: 'published' }));

  const jobs = await Job.find({ status: 'published' })
    .populate('employer', 'firstName lastName company')
    .populate('company', 'name logo industry size location description website socialLinks foundedYear')
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
  ).populate('employer', 'firstName lastName company email')
    .populate('company', 'name logo industry size location description website socialLinks foundedYear');

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  return sendSuccess(res, 200, 'Job retrieved successfully', job);
});

// @desc Create job
// @route POST /api/v1/jobs
// @access Private/Employer
exports.createJob = asyncHandler(async (req, res, next) => {
  const mongoose = require('mongoose');
  const billingController = require('./billingController');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Deduct Credits first
    await billingController.checkAndDeductCredits(req.user._id, 'JOB_POST', session);

    // Validate that company exists
    const Company = require('../models/Company');
    const company = await Company.findById(req.body.company).session(session);
    if (!company) {
      throw new Error('Invalid company selected');
    }

    const jobData = {
      ...req.body,
      employer: req.user._id,
      status: req.body.status || 'published',
    };

    const job = await Job.create([jobData], { session });
    const createdJob = job[0];

    // Add job to company's jobs array
    await Company.findByIdAndUpdate(req.body.company, {
      $push: { jobs: createdJob._id },
      $inc: { 'stats.jobsPosted': 1 }
    }, { session });

    await session.commitTransaction();
    session.endSession();

    logger.info(`Job created: ${createdJob._id}`);

    // Create notification for the employer (Notifications don't strictly need to be in the transaction, but safe to keep out or in)
    // Keeping them out of the transaction critical path to avoid locking if notification service is slow/complex, 
    // although strictly they should be "after commit".

    try {
      await notificationService.createNotification(
        req.user._id,
        'job_posted',
        'Job Posted Successfully',
        `Your job posting for "${createdJob.title}" has been created successfully.`,
        {
          jobId: createdJob._id,
          jobTitle: createdJob.title,
          link: `/jobs/${createdJob._id}`
        }
      );
    } catch (error) {
      logger.error(`Failed to create employer notification: ${error.message}`);
    }

    // Create notification for admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await notificationService.createNotification(
          admin._id,
          'admin_new_job',
          'New Job Posted',
          `${req.user.firstName} (Company: ${company.name}) has posted a new job: ${createdJob.title}`,
          {
            jobId: createdJob._id,
            employerId: req.user._id,
            jobTitle: createdJob.title,
            link: `/admin/jobs/${createdJob._id}`
          }
        );
      }
    } catch (error) {
      logger.error(`Failed to create admin notification: ${error.message}`);
    }

    return sendSuccess(res, 201, 'Job created successfully', createdJob);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, 400, `Validation Error: ${messages.join(', ')}`);
    } else if (error.message.includes('Insufficient credits')) {
      return sendError(res, 402, error.message); // Payment Required
    }

    // Pass to global error handler or throw
    return sendError(res, 400, error.message || 'Job creation failed');
  }
});

// @desc Update job
// @route PUT /api/v1/jobs/:id
// @access Private/Employer
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  // Debug logging
  console.log('Job employer:', job.employer);
  console.log('Req user _id:', req.user?._id);

  if (!req.user || !req.user._id) {
    return sendError(res, 401, 'User not authenticated');
  }

  if (!job.employer) {
    return sendError(res, 500, 'Job employer not found');
  }

  if (job.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this job');
  }

  // If company is being changed, update company relationships
  if (req.body.company && job.company && req.body.company !== job.company.toString()) {
    const Company = require('../models/Company');

    // Validate new company exists
    const newCompany = await Company.findById(req.body.company);
    if (!newCompany) {
      return sendError(res, 400, 'Invalid company selected');
    }

    // Remove job from old company's jobs array
    await Company.findByIdAndUpdate(job.company, {
      $pull: { jobs: job._id },
      $inc: { 'stats.jobsPosted': -1 }
    });

    // Add job to new company's jobs array
    await Company.findByIdAndUpdate(req.body.company, {
      $push: { jobs: job._id },
      $inc: { 'stats.jobsPosted': 1 }
    });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('company', 'name logo industry size location');

  logger.info(`Job updated: ${job._id}`);

  return sendSuccess(res, 200, 'Job updated successfully', job);
});

// @desc Delete job
// @route DELETE /api/v1/jobs/:id
// @access Private/Employer or Admin
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('company', 'name');

  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to delete this job');
  }

  // Store company name for notifications before deleting
  const companyName = job.company?.name || 'Unknown Company';

  await Job.findByIdAndDelete(req.params.id);

  // Remove job from company's jobs array
  const Company = require('../models/Company');
  await Company.findByIdAndUpdate(job.company, {
    $pull: { jobs: job._id },
    $inc: { 'stats.jobsPosted': -1 }
  });

  // Notify Employer
  try {
    await notificationService.createNotification(
      job.employer,
      'job_deleted',
      'Job Deleted',
      `Your job posting for "${job.title}" has been deleted.`,
      { jobId: job._id, jobTitle: job.title }
    );
  } catch (error) {
    logger.error(`Failed to create employer notification for delete: ${error.message}`);
  }

  // Notify Admins
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        'job_deleted',
        'Job Deleted',
        `${req.user.firstName} (Company: ${companyName}) has deleted the job: ${job.title}`,
        {
          jobId: job._id,
          employerId: req.user._id,
          jobTitle: job.title
        }
      );
    }
  } catch (error) {
    logger.error(`Failed to create admin notification for delete: ${error.message}`);
  }

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
    .populate('company', 'name logo industry size location description website socialLinks foundedYear')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Employer jobs retrieved successfully', jobs, pagination);
});
