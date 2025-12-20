const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Company = require('../models/Company');
const asyncHandler = require('../middleware/async');
const emailService = require('../services/emailService');
const config = require('../config/environment');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');
const constants = require('../utils/constants');

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

// @desc Register job seeker
// @route POST /api/v1/auth/register/job-seeker
// @access Public
exports.registerJobSeeker = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, city, province, isNewcomer, password } = req.body;

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
      phone,
      location: `${city}, ${province}`,
      password,
      role: constants.ROLES.JOB_SEEKER,
    });

    // Create job seeker profile
    const jobSeeker = await JobSeeker.create({
      user: user._id,
      firstName,
      lastName,
      email,
      phone,
      city,
      province,
      isNewcomer,
    });

    const token = user.getSignedJwt();

    logger.info(`New job seeker registered: ${user._id}`);

    return sendSuccess(res, 201, 'Job seeker registered successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      profile: jobSeeker,
      token,
    });
  } catch (error) {
    logger.error(`Job seeker registration error: ${error.message}`);
    return sendError(res, 500, 'Registration failed', { error: error.message });
  }
});

// @desc Register company
// @route POST /api/v1/auth/register/company
// @access Public
exports.registerCompany = asyncHandler(async (req, res, next) => {
  try {
    const { companyName, companyEmail, contactName, contactPhone, city, province, website, password } = req.body;

    // Check if company email already exists
    const companyExists = await Company.findOne({ email: companyEmail });
    if (companyExists) {
      return sendError(res, 400, 'Company email already registered');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: companyEmail });
    if (userExists) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: contactPhone,
      website,
      location: `${city}, ${province}`,
    });

    // Create user account for company contact
    const firstName = contactName.split(' ')[0] || contactName;
    const lastName = contactName.split(' ').slice(1).join(' ') || 'N/A';
    
    const user = await User.create({
      firstName,
      lastName,
      email: companyEmail,
      phone: contactPhone,
      location: `${city}, ${province}`,
      password,
      role: constants.ROLES.EMPLOYER,
      company: company._id,
    });

    // Add user to company employees
    company.employees.push(user._id);
    await company.save();

    const token = user.getSignedJwt();

    logger.info(`New company registered: ${company._id}, user: ${user._id}`);

    return sendSuccess(res, 201, 'Company registered successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      company,
      token,
    });
  } catch (error) {
    logger.error(`Company registration error: ${error.message}`);
    return sendError(res, 500, 'Registration failed', { error: error.message });
  }
});

// @desc Verify token
// @route GET /api/v1/auth/verify-token
// @access Private
exports.verifyToken = asyncHandler(async (req, res, next) => {
  try {
    // If middleware passed, token is valid
    return sendSuccess(res, 200, 'Token is valid', {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    return sendError(res, 500, 'Token verification failed');
  }
});

// @desc Complete user profile
// @route PUT /api/v1/auth/profile/complete
// @access Private
exports.completeProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Update profile completion status
    user.profileCompleted = true;
    await user.save();

    logger.info(`Profile completed for user: ${user._id}`);

    return sendSuccess(res, 200, 'Profile completed successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    logger.error(`Profile completion error: ${error.message}`);
    return sendError(res, 500, 'Profile completion failed');
  }
});
