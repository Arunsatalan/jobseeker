const Resume = require('../models/Resume');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const resumeParserService = require('../services/resumeParserService');
const logger = require('../utils/logger');

// @desc Upload resume
// @route POST /api/v1/resumes/upload
// @access Private/JobSeeker
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return sendError(res, 400, 'Please upload a file');
  }

  const { title } = req.body;

  // Parse resume
  const parsedData = await resumeParserService.parseResume(req.file.buffer);

  const resume = await Resume.create({
    user: req.user._id,
    title,
    fileUrl: req.file.path,
    publicId: req.file.filename,
    parsedData,
  });

  // Add resume to user
  req.user.resumes.push(resume._id);
  await req.user.save();

  logger.info(`Resume uploaded: ${resume._id}`);

  return sendSuccess(res, 201, 'Resume uploaded successfully', resume);
});

// @desc Get resumes
// @route GET /api/v1/resumes
// @access Private
exports.getResumes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Resume.countDocuments({ user: req.user._id }));

  const resumes = await Resume.find({ user: req.user._id })
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Resumes retrieved successfully', resumes, pagination);
});

// @desc Get resume by ID
// @route GET /api/v1/resumes/:id
// @access Private
exports.getResumeById = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  return sendSuccess(res, 200, 'Resume retrieved successfully', resume);
});

// @desc Update resume
// @route PUT /api/v1/resumes/:id
// @access Private
exports.updateResume = asyncHandler(async (req, res, next) => {
  const { title } = req.body;

  let resume = await Resume.findById(req.params.id);

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this resume');
  }

  resume = await Resume.findByIdAndUpdate(
    req.params.id,
    { title },
    { new: true, runValidators: true }
  );

  logger.info(`Resume updated: ${resume._id}`);

  return sendSuccess(res, 200, 'Resume updated successfully', resume);
});

// @desc Delete resume
// @route DELETE /api/v1/resumes/:id
// @access Private
exports.deleteResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to delete this resume');
  }

  // Remove from user's resumes array
  req.user.resumes = req.user.resumes.filter(id => id.toString() !== req.params.id);
  await req.user.save();

  await Resume.findByIdAndDelete(req.params.id);

  logger.info(`Resume deleted: ${req.params.id}`);

  return sendSuccess(res, 200, 'Resume deleted successfully');
});

// @desc Set default resume
// @route POST /api/v1/resumes/:id/set-default
// @access Private
exports.setDefaultResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this resume');
  }

  // Update all resumes for this user
  await Resume.updateMany(
    { user: req.user._id },
    { isPrimary: false }
  );

  // Set selected resume as primary
  resume.isPrimary = true;
  await resume.save();

  logger.info(`Default resume set: ${resume._id}`);

  return sendSuccess(res, 200, 'Default resume set successfully', resume);
});
