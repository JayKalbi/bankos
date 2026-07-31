import { Redis } from 'ioredis';
import { IRateLimitService } from '../../modules/auth/interfaces/IRateLimitService';
import { logger } from '../../observability/logger';

export class RedisRateLimitService implements IRateLimitService {
  constructor(private readonly redis: Redis) {}

  public async incrementAttempts(key: string, ttlSeconds: number): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.ttl(key);

      const results = await multi.exec();
      if (!results) {
        throw new Error('Transaction failed');
      }

      const incrResult = results[0][1] as number;
      const ttlResult = results[1][1] as number;

      if (ttlResult === -1 || ttlResult === -2) {
        await this.redis.expire(key, ttlSeconds);
      }

      logger.debug('Redis RateLimit INCR', { key });
      return incrResult;
    } catch (error) {
      logger.error('Redis RateLimit INCR failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async resetAttempts(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Redis RateLimit RESET', { key });
    } catch (error) {
      logger.error('Redis RateLimit RESET failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async getAttempts(key: string): Promise<number> {
    try {
      const result = await this.redis.get(key);
      logger.debug('Redis RateLimit GET', { key });
      return result ? parseInt(result, 10) : 0;
    } catch (error) {
      logger.error('Redis RateLimit GET failed', { key, error: (error as Error).message });
      throw error;
    }
  }
}
