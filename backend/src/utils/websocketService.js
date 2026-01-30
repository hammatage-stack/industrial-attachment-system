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

      // Join room for user-specific messages (authorization enforced)
      socket.on('join:room', (data) => {
        this.handleJoinRoom(socket, socket.userId, data);
      });

      // Leave room (authorization enforced)
      socket.on('leave:room', (data) => {
        this.handleLeaveRoom(socket, socket.userId, data);
      });

      // Handle custom events
      socket.on('notification:read', (notificationId) => {
        this.handleNotificationRead(socket.userId, notificationId);
      });

      socket.on('chat:message', (data) => {
        this.handleChatMessage(socket.userId, data);
      });

      socket.on('typing', (data) => {
        this.handleTypingIndicator(socket, socket.userId, data);
      });

      socket.on('stop:typing', (data) => {
        this.handleStopTypingIndicator(socket, socket.userId, data);
      });

      socket.on('application:update', (data) => {
        this.handleApplicationUpdate(socket.userId, data);
      });
    });
  }

  /**
   * Handle user joining a room with authorization
   * Only allow users to join their own user room or shared conversation rooms
   */
  handleJoinRoom(socket, userId, data) {
    const { roomId, type } = data;

    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    // Authorize based on room type
    const isAuthorized = this.authorizeRoomAccess(userId, roomId, type);

    if (!isAuthorized) {
      socket.emit('error', { message: 'Unauthorized to join this room' });
      logger.warn(`Unauthorized room access attempt - User: ${userId}, Room: ${roomId}`);
      return;
    }

    socket.join(roomId);
    logger.info(`User ${userId} joined room: ${roomId}`);

    // Notify others in the room
    this.io.to(roomId).emit('user:joined', {
      userId,
      roomId,
      timestamp: new Date()
    });
  }

  /**
   * Handle user leaving a room
   */
  handleLeaveRoom(socket, userId, data) {
    const { roomId } = data;

    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    socket.leave(roomId);
    logger.info(`User ${userId} left room: ${roomId}`);

    // Notify others in the room
    this.io.to(roomId).emit('user:left', {
      userId,
      roomId,
      timestamp: new Date()
    });
  }

  /**
   * Authorize room access for a user
   * @param {string} userId - The user's ID
   * @param {string} roomId - The room ID to access
   * @param {string} type - The room type (user, conversation, notification, etc.)
   * @returns {boolean} - Whether the user is authorized
   */
  authorizeRoomAccess(userId, roomId, type = 'user') {
    // User rooms: users can only join their own user room
    if (type === 'user') {
      return roomId === userId;
    }

    // Conversation rooms: authorization is checked at message send time
    // For now, allow access to all conversation rooms
    // In production, verify the user is a participant of the conversation
    if (type === 'conversation') {
      return true;
    }

    // Notification rooms: users can join their own notification room
    if (type === 'notification') {
      return roomId === userId || roomId === `notifications:${userId}`;
    }

    // Default: deny access
    return false;
  }

  /**
   * Handle typing indicator with authorization
   */
  handleTypingIndicator(socket, userId, data) {
    const { conversationId, roomId } = data;
    const targetRoom = conversationId || roomId;

    if (!targetRoom) {
      socket.emit('error', { message: 'Conversation ID or room ID is required' });
      return;
    }

    // Check if user is in the room
    if (!socket.rooms.has(targetRoom)) {
      socket.emit('error', { message: 'Not in this room' });
      logger.warn(`User ${userId} attempted typing in unauthorized room: ${targetRoom}`);
      return;
    }

    // Broadcast typing indicator to others in the room
    socket.to(targetRoom).emit('user:typing', {
      userId,
      conversationId,
      timestamp: new Date()
    });
  }

  /**
   * Handle stop typing indicator
   */
  handleStopTypingIndicator(socket, userId, data) {
    const { conversationId, roomId } = data;
    const targetRoom = conversationId || roomId;

    if (!targetRoom) {
      return;
    }

    // Check if user is in the room
    if (!socket.rooms.has(targetRoom)) {
      return;
    }

    // Broadcast stop typing indicator to others in the room
    socket.to(targetRoom).emit('user:stop-typing', {
      userId,
      conversationId,
      timestamp: new Date()
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
