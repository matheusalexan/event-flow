const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('JWT verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        error: `User does not have permission: ${permission}`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      logger.warn('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

// Rate limiting for authentication attempts
const authRateLimit = (req, res, next) => {
  const { getRedisClient } = require('../config/redis');
  
  try {
    const redisClient = getRedisClient();
    const key = `auth_attempts:${req.ip}`;
    const maxAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    redisClient.get(key, (err, attempts) => {
      if (err) {
        logger.error('Redis error in auth rate limit:', err);
        return next(); // Continue without rate limiting if Redis fails
      }

      const currentAttempts = parseInt(attempts) || 0;

      if (currentAttempts >= maxAttempts) {
        return res.status(429).json({
          success: false,
          error: 'Too many authentication attempts. Please try again later.'
        });
      }

      // Increment attempts
      redisClient.incr(key);
      redisClient.expire(key, Math.floor(windowMs / 1000));

      next();
    });
  } catch (error) {
    // If Redis is not available, continue without rate limiting
    next();
  }
};

// Reset auth attempts on successful login
const resetAuthAttempts = (req, res, next) => {
  const { getRedisClient } = require('../config/redis');
  
  try {
    const redisClient = getRedisClient();
    const key = `auth_attempts:${req.ip}`;
    redisClient.del(key);
  } catch (error) {
    // Ignore Redis errors
  }
  
  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth,
  authRateLimit,
  resetAuthAttempts
}; 