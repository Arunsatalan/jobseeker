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
  skills: [String],
  experience: String,
  education: String,
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
}, { timestamps: true });

// Indexes
jobSeekerSchema.index({ email: 1 });
jobSeekerSchema.index({ user: 1 });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
