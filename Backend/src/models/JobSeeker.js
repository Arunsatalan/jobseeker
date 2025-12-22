const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const jobSeekerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  isNewcomer: {
    type: Boolean,
    default: false,
  },
  // Career Information
  headline: String,
  currentJobTitle: String,
  company: String,
  yearsOfExperience: {
    type: Number,
    default: 0,
  },
  industry: String,
  careerObjective: String,
  // Skills & Education
  skills: [String],
  experience: String,
  education: [
    {
      degree: String,
      fieldOfStudy: String,
      institution: String,
      graduationYear: String,
    },
  ],
  languages: [String],
  // Work Preferences
  preferredWorkTypes: [String],
  openToRemote: {
    type: Boolean,
    default: false,
  },
  // Profile Visibility & Privacy
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections_only'],
      default: 'private',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showPhone: {
      type: Boolean,
      default: false,
    },
    allowMessages: {
      type: Boolean,
      default: false,
    },
  },
  // Resume
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
}, { timestamps: true });

// Indexes
jobSeekerSchema.index({ email: 1 });
jobSeekerSchema.index({ user: 1 });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
