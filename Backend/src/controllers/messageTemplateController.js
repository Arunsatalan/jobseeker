const MessageTemplate = require('../models/MessageTemplate');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// @desc Create message template
// @route POST /api/v1/messages/templates
// @access Private
exports.createTemplate = asyncHandler(async (req, res, next) => {
  const { name, type, subject, content, variables } = req.body;

  if (!name || !type || !subject || !content) {
    return sendError(res, 400, 'Name, type, subject, and content are required');
  }

  const template = await MessageTemplate.create({
    name,
    type,
    subject,
    content,
    variables: variables || [],
    createdBy: req.user._id,
  });

  logger.info(`Template created: ${template._id} by ${req.user._id}`);

  return sendSuccess(res, 201, 'Template created successfully', template);
});

// @desc Get all templates
// @route GET /api/v1/messages/templates
// @access Private
exports.getTemplates = asyncHandler(async (req, res, next) => {
  const { type, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;

  // Users can only see their own templates or active public templates
  if (req.user.role !== 'admin') {
    query.$or = [
      { createdBy: req.user._id },
      { status: 'active' },
    ];
  }

  const pagination = helpers.getPaginationData(page, limit, await MessageTemplate.countDocuments(query));

  const templates = await MessageTemplate.find(query)
    .populate('createdBy', 'firstName lastName')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Templates retrieved successfully', templates, pagination);
});

// @desc Get template by ID
// @route GET /api/v1/messages/templates/:id
// @access Private
exports.getTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');

  if (!template) {
    return sendError(res, 404, 'Template not found');
  }

  // Check access (user's own template or active public template or admin)
  if (req.user.role !== 'admin' && 
      template.createdBy._id.toString() !== req.user._id.toString() && 
      template.status !== 'active') {
    return sendError(res, 403, 'Not authorized to view this template');
  }

  return sendSuccess(res, 200, 'Template retrieved successfully', template);
});

// @desc Update template
// @route PUT /api/v1/messages/templates/:id
// @access Private
exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id);

  if (!template) {
    return sendError(res, 404, 'Template not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && template.createdBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to update this template');
  }

  const { name, type, subject, content, variables, status } = req.body;

  if (name) template.name = name;
  if (type) template.type = type;
  if (subject) template.subject = subject;
  if (content) template.content = content;
  if (variables) template.variables = variables;
  if (status) template.status = status;
  template.lastModified = new Date();

  await template.save();

  logger.info(`Template updated: ${template._id} by ${req.user._id}`);

  return sendSuccess(res, 200, 'Template updated successfully', template);
});

// @desc Delete template
// @route DELETE /api/v1/messages/templates/:id
// @access Private
exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id);

  if (!template) {
    return sendError(res, 404, 'Template not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && template.createdBy.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to delete this template');
  }

  await template.deleteOne();

  logger.info(`Template deleted: ${template._id} by ${req.user._id}`);

  return sendSuccess(res, 200, 'Template deleted successfully');
});


