const mongoose = require('mongoose');
const constants = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [String],
    skills: [String],
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    remote: Boolean,
    employmentType: {
      type: String,
      enum: Object.values(constants.EMPLOYMENT_TYPE),
      required: true,
    },
    experience: {
      type: String,
      enum: Object.values(constants.EXPERIENCE_LEVEL),
      required: true,
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'CAD',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(constants.JOB_STATUS),
      default: constants.JOB_STATUS.DRAFT,
    },
    applicants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    stats: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
    },
    expiresAt: Date,
    tags: [String],
  },
  { timestamps: true }
);

// Indexes
jobSchema.index({ employer: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ industry: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
