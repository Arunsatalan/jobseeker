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
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
