const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const emailService = require('../services/emailService');
const config = require('../config/environment');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    const token = user.getSignedJwt();

    logger.info(`New user registered: ${user._id}`);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return sendError(res, 500, 'Registration failed');
  }
});

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwt();

    logger.info(`User logged in: ${user._id}`);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return sendError(res, 500, 'Login failed');
  }
});

// @desc Forgot password
// @route POST /api/v1/auth/forgot-password
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, 'No user with that email');
    }

    // Generate reset token
    const resetToken = user.generatePasswordReset();
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetUrl);

    logger.info(`Password reset email sent to: ${email}`);

    return sendSuccess(res, 200, 'Password reset email sent');
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return sendError(res, 500, 'Error sending password reset email');
  }
});

// @desc Reset password
// @route POST /api/v1/auth/reset-password/:token
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    // Verify token
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for user: ${user._id}`);

    return sendSuccess(res, 200, 'Password reset successful');
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    return sendError(res, 500, 'Error resetting password');
  }
});

// @desc Verify email
// @route GET /api/v1/auth/verify-email/:token
// @access Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    const verificationToken = req.params.token;

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user._id}`);

    return sendSuccess(res, 200, 'Email verified successfully');
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    return sendError(res, 500, 'Error verifying email');
  }
});

// @desc Resend verification email
// @route POST /api/v1/auth/resend-verification
// @access Private
exports.resendVerification = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.isEmailVerified) {
      return sendError(res, 400, 'Email already verified');
    }

    const verificationUrl = `${config.CLIENT_URL}/verify-email/${req.user.emailVerificationToken}`;
    await emailService.sendVerificationEmail(req.user.email, verificationUrl);

    logger.info(`Verification email resent to: ${req.user.email}`);

    return sendSuccess(res, 200, 'Verification email resent');
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`);
    return sendError(res, 500, 'Error resending verification email');
  }
});
