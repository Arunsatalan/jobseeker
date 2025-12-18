const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    parsedData: {
      skills: [String],
      experience: [String],
      education: [String],
      email: String,
      phone: String,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
resumeSchema.index({ user: 1 });
resumeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
