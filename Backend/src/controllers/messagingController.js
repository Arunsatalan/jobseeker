const Message = require('../models/Message');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

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
    type,
  });

  await message.populate('sender', 'firstName lastName profilePhoto');
  await message.populate('recipient', 'firstName lastName profilePhoto');

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
