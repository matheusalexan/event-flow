const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis Connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    await redisClient.connect();

    // Test connection
    await redisClient.ping();
    logger.info('🏓 Redis ping successful');

  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    // Don't exit process for Redis connection failure
    // Application can still work without Redis (with degraded performance)
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRedis();
});

process.on('SIGTERM', async () => {
  await closeRedis();
});

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis
}; 