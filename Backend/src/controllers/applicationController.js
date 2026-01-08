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

  // Attempt to deduct credits from employer
  try {
    const billingController = require('./billingController');
    // job.employer might be an object if populated, checks needed. 
    // In applyForJob, job is fetched from Job.findById(req.params.jobId). Not populated yet.
    // So job.employer is ID.
    await billingController.checkAndDeductCredits(job.employer, 'APPLICATION');
  } catch (error) {
    logger.warn(`Credit deduction failed for employer ${job.employer}: ${error.message}`);
    // Choosing not to block application for now, but in a strict system this might block.
  }

  // Send notification to employer
  await emailService.sendApplicationNotification(
    job.employer.email,
    job.title,
    job.company
  );

  logger.info(`Application created: ${application._id}`);

  return sendSuccess(res, 201, 'Application submitted successfully', application);
});

// @desc Smart Apply - AI-optimized application submission -- Modified to include credit deduction logic
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

  // Attempt to deduct credits from employer
  try {
    const billingController = require('./billingController');
    if (job.employer && job.employer._id) {
      await billingController.checkAndDeductCredits(job.employer._id, 'APPLICATION');
    }
  } catch (error) {
    logger.warn(`Credit deduction failed for employer ${job.employer?._id}: ${error.message}`);
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
    .populate({
      path: 'job',
      select: 'title company location employer',
      populate: {
        path: 'employer',
        select: 'firstName lastName email _id'
      }
    })
    .populate('applicant', 'firstName lastName email')
    .populate('employer', 'firstName lastName email _id')
    .populate('resume', '_id parsedData')
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

  let application = await Application.findById(req.params.id)
    .populate({
      path: 'job',
      select: 'title company',
      populate: {
        path: 'company',
        select: 'name',
        model: 'Company'
      }
    })
    .populate('applicant', 'firstName lastName email');

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this application');
  }

  const oldStatus = application.status;
  application.status = status;
  application.reviewedAt = new Date();
  await application.save();

  // Send notification to applicant about status change
  try {
    const statusMessages = {
      'applied': 'Your application has been received',
      'shortlisted': 'Congratulations! Your application has been shortlisted',
      'interview': 'You have been selected for an interview',
      'rejected': 'Your application status has been updated',
      'accepted': 'Congratulations! You have been hired',
      'offered': 'You have received a job offer'
    };

    const statusTitles = {
      'applied': 'Application Received',
      'shortlisted': 'Application Shortlisted',
      'interview': 'Interview Scheduled',
      'rejected': 'Application Update',
      'accepted': 'Congratulations! You\'re Hired',
      'offered': 'Job Offer Received'
    };

    const jobTitle = application.job?.title || 'the position';
    // Handle company - it could be an object (populated) or just a string/ID
    let companyName = 'the company';
    if (application.job?.company) {
      if (typeof application.job.company === 'object' && application.job.company.name) {
        companyName = application.job.company.name;
      } else if (typeof application.job.company === 'string') {
        companyName = application.job.company;
      }
    }

    await Notification.create({
      user: application.applicant._id,
      userId: application.applicant._id, // Backward compatibility
      type: 'application_status',
      title: statusTitles[status] || 'Application Status Updated',
      message: `${statusMessages[status] || 'Your application status has been updated'} for ${jobTitle} at ${companyName}.`,
      relatedJob: application.job?._id || application.job,
      relatedApplication: application._id,
      isRead: false,
    });

    // Send email notification to applicant
    try {
      const applicantEmail = application.applicant?.email;
      if (applicantEmail) {
        const emailSubject = statusTitles[status] || 'Application Status Updated';
        const emailMessage = `${statusMessages[status] || 'Your application status has been updated'} for ${jobTitle} at ${companyName}.`;

        await emailService.sendStatusUpdateEmail(
          applicantEmail,
          emailSubject,
          emailMessage,
          jobTitle,
          companyName,
          status
        );
        logger.info(`Status update email sent to applicant ${applicantEmail}`);
      } else {
        logger.warn('No applicant email available for status update email');
      }
    } catch (emailError) {
      logger.warn('Failed to send status update email:', emailError);
    }

    logger.info(`Notification sent to applicant ${application.applicant._id} for status change: ${oldStatus} -> ${status}`);
  } catch (notifError) {
    logger.warn('Failed to create notification for applicant:', notifError);
  }

  logger.info(`Application status updated: ${application._id} from ${oldStatus} to ${status}`);

  return sendSuccess(res, 200, 'Application status updated successfully', application);
});

// @desc Update application notes
// @route PUT /api/v1/applications/:id/notes
// @access Private/Employer
exports.updateApplicationNotes = asyncHandler(async (req, res, next) => {
  const { notes } = req.body;

  let application = await Application.findById(req.params.id);

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this application');
  }

  application.notes = notes || '';
  await application.save();

  logger.info(`Application notes updated: ${application._id}`);

  return sendSuccess(res, 200, 'Notes updated successfully', application);
});

// @desc Update application rating
// @route PUT /api/v1/applications/:id/rating
// @access Private/Employer
exports.updateApplicationRating = asyncHandler(async (req, res, next) => {
  const { rating, detailedRatings } = req.body;

  let application = await Application.findById(req.params.id);

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this application');
  }

  if (rating !== undefined) {
    application.rating = rating;
  }

  if (detailedRatings) {
    application.detailedRatings = {
      ...application.detailedRatings,
      ...detailedRatings
    };
  }

  await application.save();

  logger.info(`Application rating updated: ${application._id}`);

  return sendSuccess(res, 200, 'Rating updated successfully', application);
});

// @desc Get employer applications
// @route GET /api/v1/applications/employer/applications
// @access Private/Employer
exports.getEmployerApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, jobId } = req.query;

  const query = { employer: req.user._id };
  if (status) query.status = status;
  if (jobId && jobId !== 'all') query.job = jobId;

  const pagination = helpers.getPaginationData(page, limit, await Application.countDocuments(query));

  const applications = await Application.find(query)
    .populate('job')
    .populate('applicant', 'firstName lastName email')
    .populate('resume', '_id parsedData')
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
