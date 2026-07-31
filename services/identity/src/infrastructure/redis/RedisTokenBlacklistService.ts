import { Redis } from 'ioredis';
import { ITokenBlacklistService } from '../../modules/auth/interfaces/ITokenBlacklistService';
import { logger } from '../../observability/logger';

export class RedisTokenBlacklistService implements ITokenBlacklistService {
  constructor(private readonly redis: Redis) {}

  private getBlacklistKey(jti: string): string {
    return `bl:${jti}`;
  }

  public async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    try {
      const key = this.getBlacklistKey(jti);
      await this.redis.set(key, '1', 'EX', ttlSeconds);
      logger.debug('Redis TokenBlacklist SET', { key });
    } catch (error) {
      logger.error('Redis TokenBlacklist SET failed', { error: (error as Error).message });
      throw error;
    }
  }

  public async isBlacklisted(jti: string): Promise<boolean> {
    try {
      const key = this.getBlacklistKey(jti);
      const exists = await this.redis.exists(key);
      logger.debug('Redis TokenBlacklist EXISTS', { key, blacklisted: exists > 0 });
      return exists > 0;
    } catch (error) {
      logger.error('Redis TokenBlacklist EXISTS failed', { error: (error as Error).message });
      throw error;
    }
  }

  public async remove(jti: string): Promise<void> {
    try {
      const key = this.getBlacklistKey(jti);
      await this.redis.del(key);
      logger.debug('Redis TokenBlacklist DEL', { key });
    } catch (error) {
      logger.error('Redis TokenBlacklist DEL failed', { error: (error as Error).message });
      throw error;
    }
  }
}
