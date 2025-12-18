const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: String,
    website: String,
    industry: String,
    size: String, // e.g., 'startup', 'small', 'medium', 'large', 'enterprise'
    location: String,
    country: String,
    description: String,
    logo: {
      url: String,
      publicId: String,
    },
    banner: {
      url: String,
      publicId: String,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
    foundedYear: Number,
    employees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    jobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }],
    verified: {
      type: Boolean,
      default: false,
    },
    stats: {
      jobsPosted: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Company', companySchema);
