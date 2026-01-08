const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    const { Server } = require('socket.io');
    const cors = require('cors')({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });

    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.use(async (socket, next) => {
      try {
        // Extract token from query or handshake auth
        const token = socket.handshake.query.token || socket.handshake.auth?.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verify token
        const jwt = require('jsonwebtoken');
        const config = require('../config/environment');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Attach user to socket (JWT uses 'id' field)
        socket.userId = decoded.id || decoded._id;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      logger.info(`WebSocket connected: User ${userId}`);

      // Store user connection
      this.connectedUsers.set(userId, socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle new message
      socket.on('send_message', async (data) => {
        try {
          const { recipient, content, relatedJob } = data;

          // Create message in database
          const message = await Message.create({
            sender: userId,
            recipient,
            content,
            relatedJob: relatedJob || null,
          });

          await message.populate('sender', 'firstName lastName profilePhoto email');
          await message.populate('recipient', 'firstName lastName profilePhoto email');

          // Create notification
          try {
            await Notification.create({
              user: recipient,
              userId: recipient,
              type: 'message',
              title: `New Message from ${message.sender.firstName} ${message.sender.lastName}`,
              message: content.length > 100 ? content.substring(0, 100) + '...' : content,
              relatedJob: relatedJob || null,
              isRead: false,
            });
          } catch (notifError) {
            logger.warn('Failed to create notification:', notifError);
          }

          // Emit to recipient if online
          this.io.to(`user:${recipient}`).emit('new_message', {
            message: {
              _id: message._id,
              sender: message.sender,
              recipient: message.recipient,
              content: message.content,
              createdAt: message.createdAt,
              isRead: message.isRead,
              relatedJob: message.relatedJob,
            },
          });

          // Confirm to sender
          socket.emit('message_sent', {
            success: true,
            messageId: message._id,
          });

          logger.info(`Real-time message sent from ${userId} to ${recipient}`);
        } catch (error) {
          logger.error('Error handling send_message:', error);
          socket.emit('message_error', {
            error: error.message || 'Failed to send message',
          });
        }
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { recipient, isTyping } = data;
        this.io.to(`user:${recipient}`).emit('user_typing', {
          userId,
          isTyping,
        });
      });

      // Handle read receipt
      socket.on('mark_read', async (data) => {
        try {
          const { messageId } = data;
          const message = await Message.findByIdAndUpdate(
            messageId,
            { isRead: true, readAt: new Date() },
            { new: true }
          );

          if (message) {
            // Notify sender that message was read
            this.io.to(`user:${message.sender._id}`).emit('message_read', {
              messageId: message._id,
              readAt: message.readAt,
            });
          }
        } catch (error) {
          logger.error('Error marking message as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`WebSocket disconnected: User ${userId}`);
        this.connectedUsers.delete(userId);
      });
    });

    logger.info('WebSocket server initialized');
  }

  // Helper method to emit to specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Helper method to check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

module.exports = new WebSocketService();

