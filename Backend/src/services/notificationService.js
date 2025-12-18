const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class NotificationService {
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
      });

      logger.info(`Notification created for user ${userId}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async getNotifications(userId, limit = 20, page = 1) {
    try {
      const skip = (page - 1) * limit;
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments({ userId });

      return {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Failed to get notifications: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to mark notification as read: ${error.message}`);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to mark all notifications as read: ${error.message}`);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      await Notification.findByIdAndDelete(notificationId);
      logger.info(`Notification deleted: ${notificationId}`);
    } catch (error) {
      logger.error(`Failed to delete notification: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new NotificationService();
