import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { RedisTokenBlacklistService } from '../../../src/infrastructure/redis/RedisTokenBlacklistService';

describe('RedisTokenBlacklistService', () => {
  let redis: Redis;
  let service: RedisTokenBlacklistService;

  beforeEach(() => {
    redis = new RedisMock() as unknown as Redis;
    service = new RedisTokenBlacklistService(redis);
  });

  afterEach(async () => {
    await redis.quit();
  });

  it('should blacklist a token', async () => {
    await service.blacklistToken('jti-123', 3600);
    const result = await service.isBlacklisted('jti-123');
    expect(result).toBe(true);
  });

  it('should return false if token is not blacklisted', async () => {
    const result = await service.isBlacklisted('jti-missing');
    expect(result).toBe(false);
  });

  it('should remove a token from blacklist', async () => {
    await service.blacklistToken('jti-456', 3600);
    await service.remove('jti-456');
    const result = await service.isBlacklisted('jti-456');
    expect(result).toBe(false);
  });
});
