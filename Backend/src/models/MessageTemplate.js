const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['welcome', 'application_confirmation', 'interview_invite', 'interview_reminder', 'rejection', 'offer', 'custom'],
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Template subject is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Template content is required'],
    },
    variables: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usage: {
      type: Number,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
messageTemplateSchema.index({ type: 1, status: 1 });
messageTemplateSchema.index({ createdBy: 1 });
messageTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);


