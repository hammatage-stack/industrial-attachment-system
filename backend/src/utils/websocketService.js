const socketIO = require('socket.io');
const logger = require('./logger');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * WebSocket Service for Real-Time Notifications
 * Handles live notifications, status updates, and real-time communication
 */
class WebSocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: config.corsOrigin || '*',
        methods: ['GET', 'POST']
      }
    });

    this.users = new Map(); // Map of userId -> socket connections
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.userId}`);
      this.registerUser(socket.userId, socket);

      // User connected event
      socket.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: socket.userId
      });

      // Broadcast user online status
      this.broadcastUserStatus(socket.userId, 'online');

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.userId}`);
        this.unregisterUser(socket.userId, socket);
        this.broadcastUserStatus(socket.userId, 'offline');
      });

      // Handle custom events
      socket.on('notification:read', (notificationId) => {
        this.handleNotificationRead(socket.userId, notificationId);
      });

      socket.on('chat:message', (data) => {
        this.handleChatMessage(socket.userId, data);
      });

      socket.on('application:update', (data) => {
        this.handleApplicationUpdate(socket.userId, data);
      });
    });
  }

  /**
   * Register user socket
   */
  registerUser(userId, socket) {
    if (!this.users.has(userId)) {
      this.users.set(userId, []);
    }
    this.users.get(userId).push(socket);
  }

  /**
   * Unregister user socket
   */
  unregisterUser(userId, socket) {
    const userSockets = this.users.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socket);
      if (index > -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.users.delete(userId);
      }
    }
  }

  /**
   * Broadcast user online/offline status
   */
  broadcastUserStatus(userId, status) {
    this.io.emit('user:status', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  /**
   * Send notification to specific user
   */
  notifyUser(userId, notification) {
    const userSockets = this.users.get(userId);
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach(socket => {
        socket.emit('notification:new', {
          ...notification,
          timestamp: new Date(),
          read: false
        });
      });
      logger.info(`Notification sent to user: ${userId}`);
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  notifyUsers(userIds, notification) {
    userIds.forEach(userId => {
      this.notifyUser(userId, notification);
    });
  }

  /**
   * Notify payment status change
   */
  notifyPaymentStatus(userId, payment) {
    this.notifyUser(userId, {
      type: 'payment_status',
      title: 'Payment Status Update',
      message: `Your payment (${payment.mpesaCode}) status is now: ${payment.status}`,
      data: payment
    });
  }

  /**
   * Notify application status change
   */
  notifyApplicationStatus(userId, application) {
    this.notifyUser(userId, {
      type: 'application_status',
      title: 'Application Status Update',
      message: `Your application status has changed to: ${application.status}`,
      data: application
    });
  }

  /**
   * Notify new message
   */
  notifyMessage(userId, message) {
    this.notifyUser(userId, {
      type: 'message',
      title: 'New Message',
      message: message.content,
      data: message
    });
  }

  /**
   * Handle notification read
   */
  handleNotificationRead(userId, notificationId) {
    this.io.emit('notification:marked_read', {
      userId,
      notificationId,
      timestamp: new Date()
    });
  }

  /**
   * Handle chat message
   */
  handleChatMessage(userId, data) {
    const message = {
      from: userId,
      to: data.to,
      content: data.content,
      timestamp: new Date()
    };

    // Send to recipient
    this.notifyUser(data.to, {
      type: 'chat_message',
      title: 'New Message',
      data: message
    });

    logger.info(`Chat message from ${userId} to ${data.to}`);
  }

  /**
   * Handle application update
   */
  handleApplicationUpdate(userId, data) {
    this.io.emit('application:updated', {
      userId,
      applicationId: data.applicationId,
      changes: data.changes,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast to all admins
   */
  notifyAdmins(notification) {
    this.io.emit('admin:notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.users.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.users.has(userId) && this.users.get(userId).length > 0;
  }
}

module.exports = WebSocketService;
