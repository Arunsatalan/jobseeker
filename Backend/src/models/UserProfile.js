const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
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
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    headline: String,
    about: String,
    coverPhoto: {
      url: String,
      publicId: String,
    },
    role: {
      type: String,
      enum: ['admin', 'employer', 'job_seeker'],
      required: true,
    },
    // For Job Seekers
    jobSeekerProfile: {
      headline: String,
      experience: String,
      education: String,
      skills: [String],
      resumeUrl: String,
      resumePublicId: String,
      preferredJobTitles: [String],
      preferredIndustries: [String],
      preferredLocations: [String],
      preferredEmploymentTypes: [String],
      salaryExpectation: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'CAD' },
      },
      openToRemote: Boolean,
      yearsOfExperience: Number,
    },
    // For Employers
    employerProfile: {
      companyName: String,
      industry: String,
      companySize: String,
      companyWebsite: String,
      companyDescription: String,
      companyLogo: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      companyCoverage: [String],
      registrationNumber: String,
      taxId: String,
    },
    // Social Links
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    // Profile Completion Status
    profileCompletion: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      completedFields: [String],
      lastUpdatedField: String,
      lastUpdatedDate: Date,
    },
    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'connections_only'],
        default: 'public',
      },
      showEmail: Boolean,
      showPhone: Boolean,
      allowMessages: Boolean,
    },
    // Account Settings
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      jobRecommendations: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    // Activity Tracking
    activity: {
      lastLogin: Date,
      lastProfileUpdate: Date,
      profileViews: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ email: 1 });
userProfileSchema.index({ role: 1 });
userProfileSchema.index({ 'activity.lastLogin': -1 });
userProfileSchema.index({ status: 1 });

// Pre-save middleware to update lastProfileUpdate
userProfileSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.activity.lastProfileUpdate = new Date();
  }
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
