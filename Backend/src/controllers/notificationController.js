const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');

// @desc Get user notifications
// @route GET /api/v1/notifications
// @access Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    // Build filter - support both 'user' and 'userId' fields for backward compatibility
    const filter = { $or: [{ user: req.user._id }, { userId: req.user._id }] };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    // Get notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email')
      .populate('userId', 'firstName lastName email');

    // Get total count
    const total = await Notification.countDocuments(filter);

    return sendSuccess(res, 200, 'Notifications retrieved successfully', {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve notifications');
  }
});

// @desc Mark notification as read
// @route PUT /api/v1/notifications/:id/read
// @access Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { userId: req.user._id }],
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return sendError(res, 500, 'Failed to mark notification as read');
  }
});

// @desc Mark all notifications as read
// @route PUT /api/v1/notifications/mark-all/read
// @access Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { userId: req.user._id }], isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return sendError(res, 500, 'Failed to mark all notifications as read');
  }
});

// @desc Delete notification
// @route DELETE /api/v1/notifications/:id
// @access Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { userId: req.user._id }],
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    await Notification.deleteOne({ _id: req.params.id });

    return sendSuccess(res, 200, 'Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return sendError(res, 500, 'Failed to delete notification');
  }
});

// @desc Get unread notification count
// @route GET /api/v1/notifications/count/unread
// @access Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      isRead: false,
    });

    return sendSuccess(res, 200, 'Unread count retrieved', { count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return sendError(res, 500, 'Failed to get unread count');
  }
});
