const mongoose = require('mongoose');
const constants = require('../utils/constants');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    type: {
      type: String,
      enum: Object.values(constants.MESSAGE_TYPE),
      default: constants.MESSAGE_TYPE.TEXT,
    },
    fileUrl: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    // Moderation fields
    flagged: {
      type: Boolean,
      default: false,
    },
    moderationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    moderationReason: {
      type: String,
      default: null,
    },
    moderatedAt: Date,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Channel tracking
    channels: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push', 'in-app'],
        default: 'in-app',
      },
      sentAt: Date,
      delivered: Boolean,
      deliveredAt: Date,
      opened: Boolean,
      openedAt: Date,
      clicked: Boolean,
      clickedAt: Date,
      error: String,
    }],
    // Template reference
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate',
    },
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ flagged: 1 });
messageSchema.index({ moderationScore: 1 });
messageSchema.index({ relatedJob: 1 });

module.exports = mongoose.model('Message', messageSchema);
