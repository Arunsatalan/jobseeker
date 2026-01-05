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
      $sort: { createdAt: -1 } // Sort by date first to get last message easily
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
        lastMessage: { $first: '$content' }, // Since we sorted, first is latest
        lastMessageTime: { $first: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isRead', false] },
                  { $eq: ['$recipient', req.user._id] },
                ]
              },
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
    // Filter out conversations where user doesn't exist (deleted users)
    {
      $match: {
        'user.0': { $exists: true }
      }
    }
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

    // Ensure we only look at applications for jobs posted by this employer
    // (Implicitly safe if we filter by job which is owned, but let's be safe if no filters provided)
    // Actually, we usually want to message OUR applicants.
    // Let's first find all jobs by this employer to scope the query if no specific job is selected
    const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
    const employerJobIds = employerJobs.map(j => j._id);
    query.job = { $in: employerJobIds };

    if (filters.status && filters.status !== 'all') query.status = filters.status;
    if (filters.jobId) query.job = filters.jobId; // Overrides the generic list if specific job selected via filter (though the line above effectively does 'in all my jobs') - wait. query.job should be intersection if both exist? usually jobId overrides.
    // If specific jobId is passed in filters, use it.
    if (filters.jobId) query.job = filters.jobId;

    if (filters.dateFrom || filters.dateTo) {
      query.appliedAt = {};
      if (filters.dateFrom) query.appliedAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.appliedAt.$lte = new Date(filters.dateTo);
    }

    // Filter by Job Title (Find jobs first)
    if (filters.jobTitle) {
      const jobsWithTitle = await Job.find({
        employer: req.user._id,
        title: { $regex: filters.jobTitle, $options: 'i' }
      }).select('_id');
      const jobIdsWithTitle = jobsWithTitle.map(j => j._id);

      // If we already have a job constraint (from above), we need to intersect or just use this list
      // If filters.jobId is set, title search might be redundant or conflicting. Let's assume title search refines "All Jobs"
      if (!filters.jobId) {
        query.job = { $in: jobIdsWithTitle };
      }
    }

    // Filter by Applicant Location (Find users first)
    if (filters.location) {
      const usersWithLocation = await User.find({
        location: { $regex: filters.location, $options: 'i' },
        role: { $ne: 'employer' } // optimization
      }).select('_id');
      const userIdsWithLocation = usersWithLocation.map(u => u._id);
      query.applicant = { $in: userIdsWithLocation };
    }

    const applications = await Application.find(query).select('applicant');
    recipientIds = applications.map(app => app.applicant).filter(Boolean);
    // Remove duplicates
    recipientIds = [...new Set(recipientIds.map(id => id.toString()))];
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
// @desc Send support message to admin
// @route POST /api/v1/messages/support
// @access Private
exports.sendSupportMessage = asyncHandler(async (req, res, next) => {
  const { subject, content, category, priority } = req.body;

  if (!content) {
    return sendError(res, 400, 'Message content is required');
  }

  // Find an admin to receive the message
  // In a real app, you might have a dedicated support user or a queue
  // Here we'll pick the first admin we find
  const admin = await User.findOne({ role: 'admin' });

  if (!admin) {
    return sendError(res, 500, 'No support staff available. Please try again later.');
  }

  const messageContent = subject ? `[${category || 'Support'}] ${subject}\n\n${content}` : content;

  const message = await Message.create({
    sender: req.user._id,
    recipient: admin._id,
    content: messageContent,
    type: 'support', // Custom type we added
    readAt: null,
    isRead: false,
    flagged: false, // Support messages are assumed safe or moderated differently
    channels: [{ type: 'in-app', sentAt: new Date(), delivered: true }],
    // Store metadata in a way we can retrieve it
    // Since schema doesn't have metadata, we can't easily store category/priority without schema change
    // For now, we embed it in content or just rely on the text
  });

  // Notify admin
  try {
    await Notification.create({
      user: admin._id,
      userId: admin._id,
      type: 'message',
      title: `Support Request from ${req.user.firstName}`,
      message: `Category: ${category || 'General'}. Priority: ${priority || 'Normal'}`,
      relatedJob: null,
      isRead: false,
    });

    // Emit websocket
    if (websocketService && typeof websocketService.emitToUser === 'function') {
      websocketService.emitToUser(admin._id.toString(), 'new_message', {
        message: {
          ...message.toObject(),
          sender: req.user,
        }
      });
    }
  } catch (err) {
    logger.warn('Failed to notify admin:', err);
  }

  return sendSuccess(res, 201, 'Support message sent successfully', message);
});

// @desc Get support messages (for admin)
// @route GET /api/v1/messages/support
// @access Private/Admin
exports.getSupportMessages = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = { type: 'support' };

  if (status === 'unread') {
    query.isRead = false;
  }

  const pagination = helpers.getPaginationData(page, limit, await Message.countDocuments(query));

  const messages = await Message.find(query)
    .populate('sender', 'firstName lastName email profilePhoto company')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ createdAt: -1 });

  return sendPaginated(res, 200, 'Support messages retrieved successfully', messages, pagination);
});
