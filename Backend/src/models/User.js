const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const constants = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: function() {
        return this.role !== 'employer';
      },
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      url: String,
      publicId: String,
    },
    bio: String,
    role: {
      type: String,
      enum: [constants.ROLES.ADMIN, constants.ROLES.EMPLOYER, constants.ROLES.JOB_SEEKER],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(constants.USER_STATUS),
      default: constants.USER_STATUS.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    resumes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    }],
    preferences: {
      jobTitle: String,
      industries: [String],
      experience: String,
      employmentType: [String],
      salaryMin: Number,
      salaryMax: Number,
      locations: [String],
      remote: Boolean,
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(constants.SUBSCRIPTION_PLANS),
        default: constants.SUBSCRIPTION_PLANS.FREE,
      },
      status: {
        type: String,
        enum: Object.values(constants.SUBSCRIPTION_STATUS),
        default: constants.SUBSCRIPTION_STATUS.INACTIVE,
      },
      startDate: Date,
      endDate: Date,
      stripeId: String,
    },
    stats: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      jobsPosted: { type: Number, default: 0 },
      resumeViews: { type: Number, default: 0 },
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwt = function() {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
