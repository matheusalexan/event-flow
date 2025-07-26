const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis Connected');
    });

    redisClient.on('ready', () => {
      logger.info('🔴 Redis Ready');
    });

    redisClient.on('end', () => {
      logger.warn('🔴 Redis Connection Ended');
    });

    await redisClient.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed through app termination');
      }
    });

    process.on('SIGTERM', async () => {
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed through app termination');
      }
    });

  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    // Don't exit process, Redis is optional for some features
  }
};

const getRedisClient = () => {
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

module.exports = { connectRedis, getRedisClient, closeRedis }; 