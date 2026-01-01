const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// @desc Send message
// @route POST /api/v1/messages
// @access Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { recipient, content, type } = req.body;

  if (!recipient) {
    return sendError(res, 400, 'Recipient is required');
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient,
    content,
    type: type || 'text',
    relatedJob: req.body.relatedJob || null,
  });

  await message.populate('sender', 'firstName lastName profilePhoto email');
  await message.populate('recipient', 'firstName lastName profilePhoto email');

  // Create notification for recipient
  try {
    await Notification.create({
      user: recipient,
      userId: recipient, // Backward compatibility
      type: 'message',
      title: `New Message from ${message.sender.firstName} ${message.sender.lastName}`,
      message: content.length > 100 ? content.substring(0, 100) + '...' : content,
      relatedJob: req.body.relatedJob || null,
      isRead: false,
    });

    // Send email notification to recipient
    try {
      const recipientUser = await User.findById(recipient).select('email firstName lastName');
      if (recipientUser && recipientUser.email) {
        const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
        const messagePreview = content.length > 150 ? content.substring(0, 150) + '...' : content;
        const jobTitle = req.body.jobTitle || null;
        
        await emailService.sendMessageNotification(
          recipientUser.email,
          senderName,
          messagePreview,
          jobTitle
        );
        logger.info(`Message notification email sent to ${recipientUser.email}`);
      }
    } catch (emailError) {
      logger.warn('Failed to send message notification email:', emailError);
    }

    logger.info(`Notification created for message recipient ${recipient}`);
  } catch (notifError) {
    logger.warn('Failed to create notification for message:', notifError);
  }

  logger.info(`Message sent from ${req.user._id} to ${recipient}`);

  return sendSuccess(res, 201, 'Message sent successfully', message);
});

// @desc Get conversation
// @route GET /api/v1/messages/conversation/:userId
// @access Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.params.userId;

  const query = {
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  };

  const pagination = helpers.getPaginationData(page, limit, await Message.countDocuments(query));

  const messages = await Message.find(query)
    .populate('sender', 'firstName lastName profilePhoto')
    .populate('recipient', 'firstName lastName profilePhoto')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Conversation retrieved successfully', messages.reverse(), pagination);
});

// @desc Get conversations
// @route GET /api/v1/messages
// @access Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  // Get unique conversations for the user
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id },
        ],
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$recipient',
            '$sender',
          ],
        },
        lastMessage: { $last: '$content' },
        lastMessageTime: { $last: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$isRead', false] },
                { $eq: ['$recipient', req.user._id] },
              ]},
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { lastMessageTime: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
  ]);

  return sendSuccess(res, 200, 'Conversations retrieved successfully', conversations);
});

// @desc Mark message as read
// @route PUT /api/v1/messages/:id/read
// @access Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!message) {
    return sendError(res, 404, 'Message not found');
  }

  return sendSuccess(res, 200, 'Message marked as read', message);
});
