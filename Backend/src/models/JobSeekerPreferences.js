const mongoose = require("mongoose");

const jobSeekerPreferencesSchema = new mongoose.Schema({
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true,
    unique: true,
  },
  desiredRoles: {
    type: [String],
    default: [],
  },
  locations: {
    type: [String],
    default: [],
  },
  salaryMin: {
    type: Number,
    default: 60000,
  },
  salaryMax: {
    type: Number,
    default: 100000,
  },
  salaryPeriod: {
    type: String,
    enum: ['yearly', 'monthly', 'weekly', 'hourly'],
    default: 'yearly',
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'],
    default: 'Mid-level',
  },
  workType: {
    type: [String],
    default: [],
  },
  availability: {
    type: String,
    enum: ['Immediately', '2 weeks', '1 month', '2 months', 'Not decided'],
    default: 'Immediately',
  },
  industries: {
    type: [String],
    default: [],
  },
  companySize: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
  growthOpportunities: {
    type: [String],
    default: [],
  },
  profileVisible: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
jobSeekerPreferencesSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt timestamp before updating
jobSeekerPreferencesSchema.pre('findByIdAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const JobSeekerPreferences = mongoose.model('JobSeekerPreferences', jobSeekerPreferencesSchema);

module.exports = JobSeekerPreferences;
