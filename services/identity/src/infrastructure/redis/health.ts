import { redisClient } from './client';
import { logger } from '../../observability/logger';

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', { error: (error as Error).message });
    return false;
  }
}
