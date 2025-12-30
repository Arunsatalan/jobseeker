const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
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

// @desc Smart Apply - AI-optimized application submission
// @route POST /api/v1/applications/smart-apply/:jobId
// @access Private/JobSeeker
exports.smartApplyForJob = asyncHandler(async (req, res, next) => {
  const { resumeId, optimizedResumeId, coverLetter, platform, additionalInfo } = req.body;
  const userId = req.user._id;
  const jobId = req.params.jobId;

  logger.info(`Smart Apply request: jobId=${jobId}, userId=${userId}, hasResume=${!!optimizedResumeId}`);

  // Validate job exists
  const job = await Job.findById(jobId).populate('employer');
  if (!job) {
    logger.error(`Job not found: jobId=${jobId}`);
    return sendError(res, 404, `Job not found with ID: ${jobId}`);
  }

  // Validate employer exists
  if (!job.employer) {
    logger.error(`Job has no employer: jobId=${jobId}`);
    return sendError(res, 500, 'Job employer not found. Please contact support.');
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: userId,
  });

  if (existingApplication) {
    logger.warn(`Duplicate application attempt: jobId=${jobId}, userId=${userId}`);
    return sendError(res, 400, 'You have already applied for this job');
  }

  // Validate resume exists if optimizedResumeId is provided
  if (optimizedResumeId) {
    const resume = await Resume.findById(optimizedResumeId);
    if (!resume) {
      logger.warn(`Resume not found: resumeId=${optimizedResumeId}`);
      return sendError(res, 404, 'Resume not found');
    }
  }

  // Create application with cover letter and all details
  const applicationData = {
    job: jobId,
    applicant: userId,
    employer: job.employer._id,
    coverLetter: coverLetter || '', // Store cover letter
    status: 'applied',
    appliedAt: new Date(),
  };

  // Add resume ID if provided
  if (optimizedResumeId) {
    applicationData.resume = optimizedResumeId;
  }

  const application = await Application.create(applicationData);

  logger.info(`Application created: ${application._id}, coverLetter length: ${(coverLetter || '').length}`);

  // Populate full application details
  await application.populate([
    { path: 'job', select: 'title company location' },
    { path: 'applicant', select: 'firstName lastName email phone' },
    { path: 'resume', select: 'filename title' },
  ]);

  // Update job stats
  job.stats.applications = (job.stats.applications || 0) + 1;
  if (!job.applicants.includes(userId)) {
    job.applicants.push(userId);
  }
  await job.save();

  // Create notification for applicant
  await Notification.create({
    user: userId,
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application for ${job.title} at ${job.company} has been submitted successfully!`,
    relatedJob: jobId,
    isRead: false,
  });

  // Create notification for employer
  try {
    if (job.employer && job.employer._id) {
      await Notification.create({
        user: job.employer._id,
        type: 'new_application',
        title: 'New Application',
        message: `${req.user.firstName} ${req.user.lastName} applied for ${job.title}`,
        relatedJob: jobId,
        relatedApplication: application._id,
        isRead: false,
      });
    } else {
      logger.warn('No employer available for notification');
    }
  } catch (notifError) {
    logger.warn('Failed to create employer notification:', notifError);
  }

  // Send email notification to employer
  try {
    if (job.employer && job.employer.email) {
      await emailService.sendApplicationNotification(
        job.employer.email,
        job.title,
        job.company,
        req.user.firstName + ' ' + req.user.lastName
      );
    } else {
      logger.warn('No employer email available for notification');
    }
  } catch (emailError) {
    logger.warn('Email notification failed:', emailError);
  }

  logger.info(`Smart application completed: ${application._id}`);

  return sendSuccess(res, 201, 'Application submitted successfully!', {
    applicationId: application._id,
    message: `Your application for ${job.title} at ${job.company} has been submitted!`,
    application: application,
  });
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
