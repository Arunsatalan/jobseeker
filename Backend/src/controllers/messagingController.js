const Message = require('../models/Message');
const MessageTemplate = require('../models/MessageTemplate');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const messageModerationService = require('../services/messageModerationService');
const websocketService = require('../services/websocketService');

// @desc Send message
// @route POST /api/v1/messages
// @access Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { recipient, content, type, templateId, channels } = req.body;

  if (!recipient) {
    return sendError(res, 400, 'Recipient is required');
  }

  if (!content && !templateId) {
    return sendError(res, 400, 'Message content or template ID is required');
  }

  let messageContent = content || '';
  let finalTemplateId = templateId;

  // If template is provided, load and process it
  if (templateId) {
    const template = await MessageTemplate.findById(templateId);
    if (!template || template.status !== 'active') {
      return sendError(res, 404, 'Template not found or inactive');
    }

    // Replace template variables (basic implementation)
    messageContent = template.content || '';
    if (req.body.variables) {
      Object.keys(req.body.variables).forEach(key => {
        messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), req.body.variables[key] || '');
      });
    }

    // Increment template usage
    template.usage += 1;
    await template.save();
  }

  // Ensure messageContent is not empty
  if (!messageContent || (typeof messageContent === 'string' && messageContent.trim().length === 0)) {
    return sendError(res, 400, 'Message content cannot be empty');
  }
  
  // Ensure messageContent is a string
  if (typeof messageContent !== 'string') {
    messageContent = String(messageContent || '');
  }

  // AI Content Moderation
  let moderationResult;
  try {
    moderationResult = await messageModerationService.moderateWithAI(messageContent);
  } catch (modError) {
    logger.error('Moderation service error:', modError);
    // Use safe defaults if moderation fails
    moderationResult = {
      score: 100,
      flagged: false,
      reason: null,
      confidence: 'low',
    };
  }
  
  // If content is flagged, still create message but mark it
  let message;
  try {
    message = await Message.create({
      sender: req.user._id,
      recipient,
      content: messageContent,
      type: type || 'text',
      relatedJob: req.body.relatedJob || null,
      templateId: finalTemplateId || null,
      flagged: moderationResult.flagged || false,
      moderationScore: moderationResult.score || null,
      moderationReason: moderationResult.reason || null,
      moderatedAt: new Date(),
      channels: channels || [{ type: 'in-app', sentAt: new Date(), delivered: true }],
    });
  } catch (dbError) {
    logger.error('Failed to create message:', dbError);
    return sendError(res, 500, `Failed to create message: ${dbError.message}`);
  }

  try {
    await message.populate('sender', 'firstName lastName profilePhoto email');
    await message.populate('recipient', 'firstName lastName profilePhoto email');
  } catch (populateError) {
    logger.error('Failed to populate message:', populateError);
    // Continue even if population fails
  }

  // Get sender name safely
  const senderName = message.sender 
    ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim()
    : `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Someone';

  // Create notification for recipient
  try {
    await Notification.create({
      user: recipient,
      userId: recipient, // Backward compatibility
      type: 'message',
      title: `New Message from ${senderName}`,
      message: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
      relatedJob: req.body.relatedJob || null,
      isRead: false,
    });

    // Send email notification to recipient
    try {
      const recipientUser = await User.findById(recipient).select('email firstName lastName');
      if (recipientUser && recipientUser.email) {
        const messagePreview = messageContent.length > 150 ? messageContent.substring(0, 150) + '...' : messageContent;
        const jobTitle = req.body.jobTitle || null;
        
        try {
          await emailService.sendMessageNotification(
            recipientUser.email,
            senderName,
            messagePreview,
            jobTitle
          );
          logger.info(`Message notification email sent to ${recipientUser.email}`);
        } catch (emailErr) {
          logger.warn('Failed to send email notification:', emailErr);
        }
      }
    } catch (emailError) {
      logger.warn('Failed to send message notification email:', emailError);
    }

    logger.info(`Notification created for message recipient ${recipient}`);
  } catch (notifError) {
    logger.warn('Failed to create notification for message:', notifError);
  }

  logger.info(`Message sent from ${req.user._id} to ${recipient}`);

  // Emit real-time message via WebSocket
  try {
    if (websocketService && typeof websocketService.emitToUser === 'function') {
      websocketService.emitToUser(recipient.toString(), 'new_message', {
        message: {
          _id: message._id,
          sender: message.sender || { 
            _id: req.user._id, 
            firstName: req.user.firstName, 
            lastName: req.user.lastName 
          },
          recipient: message.recipient || { _id: recipient },
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
          relatedJob: message.relatedJob,
          flagged: message.flagged,
        },
      });
    }
  } catch (wsError) {
    logger.warn('Failed to emit WebSocket message:', wsError);
    // Don't fail the request if WebSocket fails
  }

  // If message is flagged, notify admin (optional)
  if (moderationResult.flagged) {
    logger.warn(`Flagged message detected: ${message._id} - ${moderationResult.reason}`);
    // Could create admin notification here
  }

  return sendSuccess(res, 201, 'Message sent successfully', {
    message,
    moderation: {
      flagged: moderationResult.flagged,
      score: moderationResult.score,
      reason: moderationResult.reason,
    },
  });
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
  ).populate('sender', 'firstName lastName');

  if (!message) {
    return sendError(res, 404, 'Message not found');
  }

  // Notify sender via WebSocket that message was read
  try {
    websocketService.emitToUser(message.sender._id.toString(), 'message_read', {
      messageId: message._id,
      readAt: message.readAt,
    });
  } catch (wsError) {
    logger.warn('Failed to emit read receipt via WebSocket:', wsError);
  }

  return sendSuccess(res, 200, 'Message marked as read', message);
});

// @desc Send bulk messages to multiple recipients
// @route POST /api/v1/messages/bulk
// @access Private/Employer
exports.sendBulkMessages = asyncHandler(async (req, res, next) => {
  const { recipients, content, templateId, jobId, filters, channels } = req.body;

  if (!recipients && !jobId && !filters) {
    return sendError(res, 400, 'Recipients, jobId, or filters are required');
  }

  if (!content && !templateId) {
    return sendError(res, 400, 'Message content or template ID is required');
  }

  let recipientIds = [];

  // Get recipients based on provided criteria
  if (recipients && Array.isArray(recipients)) {
    recipientIds = recipients;
  } else if (jobId) {
    // Get all applicants for a job
    const applications = await Application.find({ job: jobId }).select('applicant');
    recipientIds = applications.map(app => app.applicant).filter(Boolean);
  } else if (filters) {
    // Filter by application status, date range, etc.
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.jobId) query.job = filters.jobId;
    if (filters.dateFrom || filters.dateTo) {
      query.appliedAt = {};
      if (filters.dateFrom) query.appliedAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.appliedAt.$lte = new Date(filters.dateTo);
    }
    const applications = await Application.find(query).select('applicant');
    recipientIds = applications.map(app => app.applicant).filter(Boolean);
  }

  if (recipientIds.length === 0) {
    return sendError(res, 400, 'No recipients found matching criteria');
  }

  // Limit bulk messages to prevent abuse
  if (recipientIds.length > 100) {
    return sendError(res, 400, 'Bulk messages limited to 100 recipients at a time');
  }

  let messageContent = content;
  let template = null;

  // Load template if provided
  if (templateId) {
    template = await MessageTemplate.findById(templateId);
    if (!template || template.status !== 'active') {
      return sendError(res, 404, 'Template not found or inactive');
    }
    messageContent = template.content;
  }

  // Process moderation for bulk messages
  const moderationResult = await messageModerationService.moderateWithAI(messageContent);
  if (moderationResult.flagged) {
    return sendError(res, 400, `Message content flagged: ${moderationResult.reason}`);
  }

  // Create messages for all recipients
  const messages = [];
  const errors = [];

  for (const recipientId of recipientIds) {
    try {
      // Replace template variables per recipient if needed
      let finalContent = messageContent;
      if (template && req.body.variables) {
        // Could personalize per recipient here
        Object.keys(req.body.variables).forEach(key => {
          finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), req.body.variables[key]);
        });
      }

      const message = await Message.create({
        sender: req.user._id,
        recipient: recipientId,
        content: finalContent,
        type: 'text',
        relatedJob: jobId || filters?.jobId || null,
        templateId: templateId || null,
        moderationScore: moderationResult.score,
        channels: channels || [{ type: 'in-app', sentAt: new Date(), delivered: true }],
      });

      // Create notification
      try {
        await Notification.create({
          user: recipientId,
          userId: recipientId,
          type: 'message',
          title: `New Message from ${req.user.firstName} ${req.user.lastName}`,
          message: finalContent.length > 100 ? finalContent.substring(0, 100) + '...' : finalContent,
          relatedJob: jobId || filters?.jobId || null,
          isRead: false,
        });
      } catch (notifError) {
        logger.warn(`Failed to create notification for recipient ${recipientId}:`, notifError);
      }

      // Emit real-time message via WebSocket
      try {
        websocketService.emitToUser(recipientId, 'new_message', {
          message: {
            _id: message._id,
            sender: req.user,
            content: finalContent,
            createdAt: message.createdAt,
            isRead: false,
          },
        });
      } catch (wsError) {
        logger.warn(`Failed to emit WebSocket message to ${recipientId}:`, wsError);
      }

      messages.push(message);
    } catch (error) {
      errors.push({ recipientId, error: error.message });
      logger.error(`Failed to send bulk message to ${recipientId}:`, error);
    }
  }

  // Update template usage if used
  if (template) {
    template.usage += messages.length;
    await template.save();
  }

  logger.info(`Bulk messages sent: ${messages.length} successful, ${errors.length} failed`);

  return sendSuccess(res, 201, 'Bulk messages sent', {
    sent: messages.length,
    failed: errors.length,
    messages: messages.slice(0, 10), // Return first 10 for preview
    errors: errors.slice(0, 10),
  });
});

// @desc Get messaging analytics
// @route GET /api/v1/messages/analytics
// @access Private
exports.getMessagingAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, jobId } = req.query;
  const userId = req.user._id;

  const query = {
    $or: [
      { sender: userId },
      { recipient: userId },
    ],
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (jobId) {
    query.relatedJob = jobId;
  }

  // Get message statistics
  const totalMessages = await Message.countDocuments(query);
  const sentMessages = await Message.countDocuments({ ...query, sender: userId });
  const receivedMessages = await Message.countDocuments({ ...query, recipient: userId });
  const unreadMessages = await Message.countDocuments({ ...query, recipient: userId, isRead: false });
  const flaggedMessages = await Message.countDocuments({ ...query, flagged: true });

  // Get engagement metrics
  const messagesWithChannels = await Message.find(query).select('channels');
  let totalDelivered = 0;
  let totalOpened = 0;
  let totalClicked = 0;

  messagesWithChannels.forEach(msg => {
    msg.channels.forEach(channel => {
      if (channel.delivered) totalDelivered++;
      if (channel.opened) totalOpened++;
      if (channel.clicked) totalClicked++;
    });
  });

  // Get messages by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyStats = await Message.aggregate([
    {
      $match: {
        ...query,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return sendSuccess(res, 200, 'Analytics retrieved successfully', {
    overview: {
      totalMessages,
      sentMessages,
      receivedMessages,
      unreadMessages,
      flaggedMessages,
    },
    engagement: {
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(2) : 0,
      clickRate: totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(2) : 0,
    },
    dailyStats,
  });
});

// @desc Get flagged messages (for admin moderation)
// @route GET /api/v1/messages/flagged
// @access Private/Admin
exports.getFlaggedMessages = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const query = { flagged: true };
  const pagination = helpers.getPaginationData(page, limit, await Message.countDocuments(query));

  const messages = await Message.find(query)
    .populate('sender', 'firstName lastName email')
    .populate('recipient', 'firstName lastName email')
    .populate('relatedJob', 'title')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ moderatedAt: -1, createdAt: -1 });

  return sendPaginated(res, 200, 'Flagged messages retrieved successfully', messages, pagination);
});

// @desc Update message moderation status
// @route PUT /api/v1/messages/:id/moderate
// @access Private/Admin
exports.updateModerationStatus = asyncHandler(async (req, res, next) => {
  const { flagged, moderationReason } = req.body;

  const message = await Message.findById(req.params.id);

  if (!message) {
    return sendError(res, 404, 'Message not found');
  }

  const updateData = {
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };

  if (flagged !== undefined) {
    updateData.flagged = flagged;
  }

  if (moderationReason) {
    updateData.moderationReason = moderationReason;
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  return sendSuccess(res, 200, 'Moderation status updated', updatedMessage);
});
