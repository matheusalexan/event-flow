const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const socketHandler = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);

    // Join user to events they're registered for
    socket.on('join-event', (eventId) => {
      socket.join(`event:${eventId}`);
      logger.info(`User ${socket.user.name} joined event ${eventId}`);
    });

    // Leave event room
    socket.on('leave-event', (eventId) => {
      socket.leave(`event:${eventId}`);
      logger.info(`User ${socket.user.name} left event ${eventId}`);
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      const { eventId, message, type = 'text' } = data;
      
      if (!message || !eventId) {
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        eventId,
        userId: socket.user.id,
        userName: socket.user.name,
        userAvatar: socket.user.avatar,
        message,
        type,
        timestamp: new Date().toISOString()
      };

      // Broadcast to event room
      io.to(`event:${eventId}`).emit('new-message', messageData);
      
      logger.info(`Message sent in event ${eventId} by ${socket.user.name}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (eventId) => {
      socket.to(`event:${eventId}`).emit('user-typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        eventId
      });
    });

    socket.on('typing-stop', (eventId) => {
      socket.to(`event:${eventId}`).emit('user-stop-typing', {
        userId: socket.user.id,
        eventId
      });
    });

    // Handle Q&A
    socket.on('ask-question', (data) => {
      const { eventId, question } = data;
      
      if (!question || !eventId) {
        return;
      }

      const questionData = {
        id: Date.now().toString(),
        eventId,
        userId: socket.user.id,
        userName: socket.user.name,
        userAvatar: socket.user.avatar,
        question,
        timestamp: new Date().toISOString(),
        answered: false
      };

      // Broadcast to event room
      io.to(`event:${eventId}`).emit('new-question', questionData);
      
      logger.info(`Question asked in event ${eventId} by ${socket.user.name}`);
    });

    // Handle question answers (speakers/organizers only)
    socket.on('answer-question', (data) => {
      const { questionId, answer, eventId } = data;
      
      if (!answer || !questionId || !eventId) {
        return;
      }

      // Check if user is speaker or organizer
      if (!['speaker', 'organizer', 'admin'].includes(socket.user.role)) {
        return;
      }

      const answerData = {
        questionId,
        eventId,
        answeredBy: socket.user.id,
        answeredByName: socket.user.name,
        answer,
        timestamp: new Date().toISOString()
      };

      // Broadcast to event room
      io.to(`event:${eventId}`).emit('question-answered', answerData);
      
      logger.info(`Question answered in event ${eventId} by ${socket.user.name}`);
    });

    // Handle polls
    socket.on('create-poll', (data) => {
      const { eventId, question, options } = data;
      
      if (!question || !options || !eventId) {
        return;
      }

      // Check if user is speaker or organizer
      if (!['speaker', 'organizer', 'admin'].includes(socket.user.role)) {
        return;
      }

      const pollData = {
        id: Date.now().toString(),
        eventId,
        createdBy: socket.user.id,
        createdByName: socket.user.name,
        question,
        options: options.map(option => ({
          id: option.id,
          text: option.text,
          votes: 0
        })),
        timestamp: new Date().toISOString(),
        active: true
      };

      // Broadcast to event room
      io.to(`event:${eventId}`).emit('new-poll', pollData);
      
      logger.info(`Poll created in event ${eventId} by ${socket.user.name}`);
    });

    // Handle poll votes
    socket.on('vote-poll', (data) => {
      const { pollId, optionId, eventId } = data;
      
      if (!pollId || !optionId || !eventId) {
        return;
      }

      const voteData = {
        pollId,
        optionId,
        eventId,
        userId: socket.user.id,
        timestamp: new Date().toISOString()
      };

      // Broadcast to event room
      io.to(`event:${eventId}`).emit('poll-vote', voteData);
      
      logger.info(`Poll vote cast in event ${eventId} by ${socket.user.name}`);
    });

    // Handle user status updates
    socket.on('update-status', (data) => {
      const { eventId, status } = data;
      
      const statusData = {
        userId: socket.user.id,
        userName: socket.user.name,
        eventId,
        status, // 'online', 'away', 'busy'
        timestamp: new Date().toISOString()
      };

      // Broadcast to event room
      socket.to(`event:${eventId}`).emit('user-status-update', statusData);
    });

    // Handle private messages
    socket.on('private-message', (data) => {
      const { recipientId, message } = data;
      
      if (!message || !recipientId) {
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        senderId: socket.user.id,
        senderName: socket.user.name,
        senderAvatar: socket.user.avatar,
        recipientId,
        message,
        timestamp: new Date().toISOString()
      };

      // Send to recipient
      io.to(`user:${recipientId}`).emit('private-message', messageData);
      
      // Send confirmation to sender
      socket.emit('message-sent', messageData);
      
      logger.info(`Private message sent from ${socket.user.name} to user ${recipientId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.name} (${socket.user.id})`);
      
      // Notify other users in the same events
      socket.rooms.forEach(room => {
        if (room.startsWith('event:')) {
          socket.to(room).emit('user-disconnected', {
            userId: socket.user.id,
            userName: socket.user.name,
            eventId: room.replace('event:', '')
          });
        }
      });
    });
  });

  // Handle server events
  const handleEventUpdate = (eventId, updateType, data) => {
    io.to(`event:${eventId}`).emit('event-update', {
      type: updateType,
      data,
      timestamp: new Date().toISOString()
    });
  };

  const handleUserNotification = (userId, notification) => {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  };

  // Export functions for use in other parts of the application
  return {
    handleEventUpdate,
    handleUserNotification
  };
};

module.exports = socketHandler; 