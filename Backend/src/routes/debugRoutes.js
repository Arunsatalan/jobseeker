const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Debug endpoint - Get current authenticated user info
router.get('/debug/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Debug endpoint - Get all notifications in database for this admin
router.get('/debug/all-notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Debug endpoint - Get ALL notifications in database (for any admin)
router.get('/debug/all-admin-notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: 'admin_notification',
    }).populate('userId', 'firstName lastName email _id');

    res.json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => ({
        _id: n._id,
        userId: n.userId._id,
        userEmail: n.userId.email,
        userName: `${n.userId.firstName} ${n.userId.lastName}`,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Debug endpoint - Get all admin users
router.get('/debug/all-admins', protect, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }, '_id firstName lastName email');

    res.json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
