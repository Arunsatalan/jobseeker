const mongoose = require('mongoose');
const constants = require('../utils/constants');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    status: {
      type: String,
      enum: Object.values(constants.APPLICATION_STATUS),
      default: constants.APPLICATION_STATUS.APPLIED,
    },
    coverLetter: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    detailedRatings: {
      technical: { type: Number, min: 0, max: 5, default: 0 },
      cultural: { type: Number, min: 0, max: 5, default: 0 },
      communication: { type: Number, min: 0, max: 5, default: 0 },
      experience: { type: Number, min: 0, max: 5, default: 0 }
    },
    notes: {
      type: String,
      default: ''
    },
    feedback: String,
    interviewDate: Date,
    interviewLink: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

// Indexes
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ employer: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
