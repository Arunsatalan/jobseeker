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
    role: {
      type: String,
      trim: true,
      index: true, // Index for easy searching
    },
    fileUrl: {
      type: String,
      required: false, // Not required for structured resumes
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    parsedData: {
      // Basic info
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      summary: String,

      // Detailed arrays
      experience: [{
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        location: String,
        description: String,
        _id: false
      }],
      education: [{
        school: String,
        degree: String,
        field: String,
        graduationDate: String,
        gpa: String,
        _id: false
      }],
      skills: [{
        category: String,
        items: [String],
        _id: false
      }],
      certifications: [{
        title: String,
        issuer: String,
        date: String,
        _id: false
      }],
      languages: [{
        language: String,
        proficiency: String,
        _id: false
      }],
      projects: [{
        name: String,
        technologies: String,
        demoUrl: String,
        githubUrl: String,
        description: String,
        _id: false
      }],
      references: [{
        name: String,
        position: String,
        company: String,
        email: String,
        phone: String,
        _id: false
      }],

      // Legacy fields for backward compatibility
      skills_legacy: [String],
      experience_legacy: [String],
      education_legacy: [String],

      // AI Optimization Metadata
      optimizationMetadata: {
        addedKeywords: [String],
        matchScore: Number,
        changesSummary: [String]
      }
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
