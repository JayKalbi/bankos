import { Redis } from 'ioredis';
import { ICacheService } from '../../modules/auth/interfaces/ICacheService';
import { logger } from '../../observability/logger';

export class RedisCacheService implements ICacheService {
  constructor(private readonly redis: Redis) {}

  public async get(key: string): Promise<string | null> {
    try {
      const result = await this.redis.get(key);
      logger.debug('Redis GET', { key, found: result !== null });
      return result;
    } catch (error) {
      logger.error('Redis GET failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, value);
      }
      logger.debug('Redis SET', { key, ttlSeconds });
    } catch (error) {
      logger.error('Redis SET failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Redis DEL', { key });
    } catch (error) {
      logger.error('Redis DEL failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const count = await this.redis.exists(key);
      logger.debug('Redis EXISTS', { key, exists: count > 0 });
      return count > 0;
    } catch (error) {
      logger.error('Redis EXISTS failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, ttlSeconds);
      logger.debug('Redis EXPIRE', { key, ttlSeconds });
    } catch (error) {
      logger.error('Redis EXPIRE failed', { key, error: (error as Error).message });
      throw error;
    }
  }

  public async increment(key: string): Promise<number> {
    try {
      const result = await this.redis.incr(key);
      logger.debug('Redis INCR', { key });
      return result;
    } catch (error) {
      logger.error('Redis INCR failed', { key, error: (error as Error).message });
      throw error;
    }
  }
}
