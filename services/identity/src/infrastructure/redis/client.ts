import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../../observability/logger';

let instance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!instance) {
    instance = new Redis(config.redis.url, {
      connectTimeout: config.redis.connectTimeoutMs,
      maxRetriesPerRequest: config.redis.maxRetries,
      keyPrefix: config.redis.keyPrefix,
      lazyConnect: true,
    });

    instance.on('connect', () => {
      logger.info('Redis client connected');
    });

    instance.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    instance.on('close', () => {
      logger.warn('Redis client closed');
    });
  }
  return instance;
}

export async function closeRedis(): Promise<void> {
  if (instance) {
    await instance.quit();
    instance = null;
  }
}

export const redisClient = getRedisClient();
