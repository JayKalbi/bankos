import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { RedisRateLimitService } from '../../../src/infrastructure/redis/RedisRateLimitService';

describe('RedisRateLimitService', () => {
  let redis: Redis;
  let service: RedisRateLimitService;

  beforeEach(() => {
    redis = new RedisMock() as unknown as Redis;
    service = new RedisRateLimitService(redis);
  });

  afterEach(async () => {
    await redis.quit();
  });

  it('should increment attempts and return current count', async () => {
    const attempt1 = await service.incrementAttempts('rate:123', 60);
    expect(attempt1).toBe(1);

    const attempt2 = await service.incrementAttempts('rate:123', 60);
    expect(attempt2).toBe(2);
  });

  it('should get current attempts', async () => {
    await service.incrementAttempts('rate:get', 60);
    const count = await service.getAttempts('rate:get');
    expect(count).toBe(1);
  });

  it('should return 0 attempts if not found', async () => {
    const count = await service.getAttempts('rate:missing');
    expect(count).toBe(0);
  });

  it('should reset attempts', async () => {
    await service.incrementAttempts('rate:reset', 60);
    await service.resetAttempts('rate:reset');
    const count = await service.getAttempts('rate:reset');
    expect(count).toBe(0);
  });
});
