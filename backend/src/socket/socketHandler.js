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
    logger.info(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join driver to driver room if applicable
    if (socket.user.role === 'driver') {
      socket.join('drivers');
    }

    // Join passenger to passenger room if applicable
    if (socket.user.role === 'passenger') {
      socket.join('passengers');
    }

    // Handle ride request
    socket.on('request-ride', async (data) => {
      try {
        logger.info(`Ride requested by ${socket.user.name}:`, data);
        
        // Notify nearby drivers
        socket.to('drivers').emit('new-ride-request', {
          ...data,
          passenger: {
            id: socket.user._id,
            name: socket.user.name,
            rating: socket.user.rating || 0
          }
        });

        // Confirm to passenger
        socket.emit('ride-requested', {
          message: 'Solicitação enviada aos motoristas próximos',
          requestId: Date.now().toString()
        });
      } catch (error) {
        logger.error('Error handling ride request:', error);
        socket.emit('error', { message: 'Erro ao solicitar corrida' });
      }
    });

    // Handle ride acceptance
    socket.on('accept-ride', async (data) => {
      try {
        logger.info(`Ride accepted by ${socket.user.name}:`, data);
        
        // Notify passenger
        socket.to(`user_${data.passengerId}`).emit('ride-accepted', {
          driver: {
            id: socket.user._id,
            name: socket.user.name,
            rating: socket.user.rating || 0
          },
          estimatedArrival: data.estimatedArrival,
          vehicleInfo: data.vehicleInfo
        });

        // Join ride room
        socket.join(`ride_${data.rideId}`);
        socket.to(`user_${data.passengerId}`).socketsJoin(`ride_${data.rideId}`);
      } catch (error) {
        logger.error('Error handling ride acceptance:', error);
        socket.emit('error', { message: 'Erro ao aceitar corrida' });
      }
    });

    // Handle location updates
    socket.on('update-location', async (data) => {
      try {
        logger.info(`Location update from ${socket.user.name}:`, data);
        
        // Broadcast to ride room if in a ride
        if (data.rideId) {
          socket.to(`ride_${data.rideId}`).emit('location-updated', {
            userId: socket.user._id,
            location: data.location,
            timestamp: new Date()
          });
        }
      } catch (error) {
        logger.error('Error handling location update:', error);
      }
    });

    // Handle ride status updates
    socket.on('update-ride-status', async (data) => {
      try {
        logger.info(`Ride status update from ${socket.user.name}:`, data);
        
        socket.to(`ride_${data.rideId}`).emit('ride-status-updated', {
          status: data.status,
          updatedBy: socket.user._id,
          timestamp: new Date(),
          message: data.message
        });
      } catch (error) {
        logger.error('Error handling ride status update:', error);
      }
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      try {
        logger.info(`Message from ${socket.user.name}:`, data);
        
        const messageData = {
          id: Date.now().toString(),
          sender: {
            id: socket.user._id,
            name: socket.user.name,
            role: socket.user.role
          },
          message: data.message,
          timestamp: new Date()
        };

        socket.to(`ride_${data.rideId}`).emit('new-message', messageData);
      } catch (error) {
        logger.error('Error handling message:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`ride_${data.rideId}`).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`ride_${data.rideId}`).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Handle ride completion
    socket.on('complete-ride', async (data) => {
      try {
        logger.info(`Ride completed by ${socket.user.name}:`, data);
        
        socket.to(`ride_${data.rideId}`).emit('ride-completed', {
          completedBy: socket.user._id,
          timestamp: new Date(),
          finalPrice: data.finalPrice,
          distance: data.distance,
          duration: data.duration
        });

        // Leave ride room
        socket.leave(`ride_${data.rideId}`);
      } catch (error) {
        logger.error('Error handling ride completion:', error);
      }
    });

    // Handle ride cancellation
    socket.on('cancel-ride', async (data) => {
      try {
        logger.info(`Ride cancelled by ${socket.user.name}:`, data);
        
        socket.to(`ride_${data.rideId}`).emit('ride-cancelled', {
          cancelledBy: socket.user._id,
          reason: data.reason,
          timestamp: new Date()
        });

        // Leave ride room
        socket.leave(`ride_${data.rideId}`);
      } catch (error) {
        logger.error('Error handling ride cancellation:', error);
      }
    });

    // Handle driver status updates
    socket.on('update-driver-status', async (data) => {
      try {
        logger.info(`Driver status update from ${socket.user.name}:`, data);
        
        if (socket.user.role === 'driver') {
          socket.to('passengers').emit('driver-status-updated', {
            driverId: socket.user._id,
            status: data.status,
            location: data.location
          });
        }
      } catch (error) {
        logger.error('Error handling driver status update:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.name} (${socket.user._id})`);
      
      // Notify others in ride rooms
      socket.rooms.forEach(room => {
        if (room.startsWith('ride_')) {
          socket.to(room).emit('user-disconnected', {
            userId: socket.user._id,
            userName: socket.user.name,
            timestamp: new Date()
          });
        }
      });
    });
  });

  // Server-side event emitters
  const handleRideUpdate = (rideId, event, data) => {
    io.to(`ride_${rideId}`).emit(event, data);
  };

  const handleUserNotification = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const handleDriverNotification = (event, data) => {
    io.to('drivers').emit(event, data);
  };

  const handlePassengerNotification = (event, data) => {
    io.to('passengers').emit(event, data);
  };

  return {
    handleRideUpdate,
    handleUserNotification,
    handleDriverNotification,
    handlePassengerNotification
  };
};

module.exports = socketHandler; 