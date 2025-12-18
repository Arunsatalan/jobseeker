const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// @desc Get user profile
// @route GET /api/v1/users/profile
// @access Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('resumes')
    .populate('company');

  return sendSuccess(res, 200, 'Profile retrieved successfully', user);
});

// @desc Update user profile
// @route PUT /api/v1/users/profile
// @access Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone, location, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone, location, bio },
    { new: true, runValidators: true }
  );

  logger.info(`User profile updated: ${user._id}`);

  return sendSuccess(res, 200, 'Profile updated successfully', user);
});

// @desc Get public user profile
// @route GET /api/v1/users/:id
// @access Public
exports.getUserPublic = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('company');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  return sendSuccess(res, 200, 'User retrieved successfully', user);
});

// @desc Update user preferences
// @route PUT /api/v1/users/preferences
// @access Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const { preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferences },
    { new: true, runValidators: true }
  );

  logger.info(`User preferences updated: ${user._id}`);

  return sendSuccess(res, 200, 'Preferences updated successfully', user);
});

// @desc Get user preferences
// @route GET /api/v1/users/preferences
// @access Private
exports.getPreferences = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('preferences');

  return sendSuccess(res, 200, 'Preferences retrieved successfully', user.preferences);
});

// @desc Get all users (Admin)
// @route GET /api/v1/users/admin/list
// @access Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;

  const pagination = helpers.getPaginationData(page, limit, await User.countDocuments(query));

  const users = await User.find(query)
    .select('-password -emailVerificationToken -passwordResetToken')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Users retrieved successfully', users, pagination);
});

// @desc Delete user
// @route DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  logger.info(`User deleted: ${req.params.id}`);

  return sendSuccess(res, 200, 'User deleted successfully');
});
