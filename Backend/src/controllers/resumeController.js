const Resume = require('../models/Resume');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const resumeParserService = require('../services/resumeParserService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cloudinary = require('cloudinary').v2;

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
  const { title, role, parsedData } = req.body;

  let resume = await Resume.findById(req.params.id);

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  if (resume.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this resume');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (role !== undefined) updateData.role = role;
  if (parsedData !== undefined) updateData.parsedData = parsedData;

  resume = await Resume.findByIdAndUpdate(
    req.params.id,
    updateData,
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

// @desc Save structured resume data
// @route POST /api/v1/resumes/save
// @desc Save structured resume data
// @route POST /api/v1/resumes/save
// @access Private
exports.saveResumeData = asyncHandler(async (req, res, next) => {
  const resumeData = req.body;

  if (!resumeData.name) {
    return sendError(res, 400, 'Resume name is required');
  }

  // Process skills to preserve category information
  const processedSkills = resumeData.skills?.map(group => ({
    category: group.category || 'other',
    items: group.items && Array.isArray(group.items) ? group.items.filter(item => item && item.trim()) : []
  })) || [];

  try {
    // Create resume with structured data
    const resume = await Resume.create({
      user: req.user._id,
      title: resumeData.title || resumeData.name || 'My Resume',
      role: resumeData.role || null,
      fileUrl: '', // No file URL for structured data
      publicId: '',
      parsedData: {
        name: resumeData.name,
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        summary: resumeData.summary,
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: processedSkills,
        certifications: resumeData.certifications || [],
        languages: resumeData.languages || [],
        projects: resumeData.projects || [],
        references: resumeData.references || [],
      },
    });

    // Add resume to user
    req.user.resumes.push(resume._id);
    await req.user.save();

    logger.info(`Resume data saved: ${resume._id}`);

    return sendSuccess(res, 201, 'Resume data saved successfully', resume);
  } catch (error) {
    logger.error(`Error saving resume: ${error.message}`);
    console.error('Resume save error details:', error);
    return sendError(res, 500, `Failed to save resume: ${error.message}`);
  }
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

// @desc Download resume
// @route GET /api/v1/resumes/:id/download
// @access Private
exports.downloadResume = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const resume = await Resume.findById(id);

  if (!resume) {
    return sendError(res, 404, 'Resume not found');
  }

  if (!resume.fileUrl) {
    return sendError(res, 400, 'No file available for download');
  }

  res.download(resume.fileUrl, resume.title || 'resume.pdf', (err) => {
    if (err) {
      logger.error(`Error downloading resume: ${err.message}`);
      return sendError(res, 500, 'Error downloading file');
    }
  });
});
