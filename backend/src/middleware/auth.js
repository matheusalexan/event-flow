const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo'
        });
      }

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Usuário com role ${req.user.role} não tem permissão para acessar este recurso`
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
        error: 'Usuário não autenticado'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        error: `Usuário não tem permissão: ${permission}`
      });
    }

    next();
  };
};

// Optional authentication (doesn't block if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Don't block, just don't set user
      logger.warn('Optional auth failed:', error.message);
    }
  }

  next();
});

// Rate limiting for authentication attempts
const authRateLimit = asyncHandler(async (req, res, next) => {
  const { getRedisClient } = require('../config/redis');
  const redisClient = getRedisClient();

  if (!redisClient) {
    return next(); // Skip rate limiting if Redis is not available
  }

  const ip = req.ip;
  const key = `auth_attempts:${ip}`;
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  try {
    const attempts = await redisClient.get(key);
    const currentAttempts = attempts ? parseInt(attempts) : 0;

    if (currentAttempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
      });
    }

    await redisClient.incr(key);
    if (currentAttempts === 0) {
      await redisClient.expire(key, Math.floor(windowMs / 1000));
    }

    next();
  } catch (error) {
    logger.error('Rate limiting error:', error);
    next(); // Continue if rate limiting fails
  }
});

// Reset authentication attempts on successful login
const resetAuthAttempts = asyncHandler(async (req, res, next) => {
  const { getRedisClient } = require('../config/redis');
  const redisClient = getRedisClient();

  if (redisClient) {
    const ip = req.ip;
    const key = `auth_attempts:${ip}`;
    
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Error resetting auth attempts:', error);
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth,
  authRateLimit,
  resetAuthAttempts
}; 