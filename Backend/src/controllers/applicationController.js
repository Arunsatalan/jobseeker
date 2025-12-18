const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// @desc Apply for job
// @route POST /api/v1/applications/:jobId
// @access Private/JobSeeker
exports.applyForJob = asyncHandler(async (req, res, next) => {
  const { resume, coverLetter } = req.body;

  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return sendError(res, 404, 'Job not found');
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: req.params.jobId,
    applicant: req.user._id,
  });

  if (existingApplication) {
    return sendError(res, 400, 'Already applied for this job');
  }

  const application = await Application.create({
    job: req.params.jobId,
    applicant: req.user._id,
    employer: job.employer,
    resume,
    coverLetter,
  });

  // Update job stats
  job.stats.applications += 1;
  job.applicants.push(req.user._id);
  await job.save();

  // Send notification to employer
  await emailService.sendApplicationNotification(
    job.employer.email,
    job.title,
    job.company
  );

  logger.info(`Application created: ${application._id}`);

  return sendSuccess(res, 201, 'Application submitted successfully', application);
});

// @desc Get applications
// @route GET /api/v1/applications
// @access Private
exports.getApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const query = { applicant: req.user._id };
  const pagination = helpers.getPaginationData(page, limit, await Application.countDocuments(query));

  const applications = await Application.find(query)
    .populate('job')
    .populate('employer', 'firstName lastName')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Applications retrieved successfully', applications, pagination);
});

// @desc Get application by ID
// @route GET /api/v1/applications/:id
// @access Private
exports.getApplicationById = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('job')
    .populate('applicant')
    .populate('employer');

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  return sendSuccess(res, 200, 'Application retrieved successfully', application);
});

// @desc Update application status
// @route PUT /api/v1/applications/:id/status
// @access Private/Employer
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  let application = await Application.findById(req.params.id);

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this application');
  }

  application.status = status;
  application.reviewedAt = new Date();
  await application.save();

  logger.info(`Application status updated: ${application._id}`);

  return sendSuccess(res, 200, 'Application status updated successfully', application);
});

// @desc Get employer applications
// @route GET /api/v1/applications/employer/applications
// @access Private/Employer
exports.getEmployerApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { employer: req.user._id };
  if (status) query.status = status;

  const pagination = helpers.getPaginationData(page, limit, await Application.countDocuments(query));

  const applications = await Application.find(query)
    .populate('job')
    .populate('applicant', 'firstName lastName email')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Applications retrieved successfully', applications, pagination);
});

// @desc Get all applications (Admin)
// @route GET /api/v1/applications/admin/all
// @access Private/Admin
exports.getAllApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Application.countDocuments({}));

  const applications = await Application.find({})
    .populate('job')
    .populate('applicant')
    .populate('employer')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Applications retrieved successfully', applications, pagination);
});
