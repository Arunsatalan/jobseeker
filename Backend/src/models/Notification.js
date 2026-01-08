const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Deprecated: kept for backward compatibility
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'welcome',
        'job_match',
        'application_status',
        'application_update',
        'application_submitted',
        'new_application',
        'message',
        'profile_update',
        'subscription',
        'admin_notification',
        'job_posted',
        'admin_new_job',
        'job_deleted',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    data: mongoose.Schema.Types.Mixed,
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    actionUrl: String,
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 }); // Backward compatibility
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
