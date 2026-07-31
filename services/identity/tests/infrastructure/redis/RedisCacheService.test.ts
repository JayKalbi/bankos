import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { RedisCacheService } from '../../../src/infrastructure/redis/RedisCacheService';

describe('RedisCacheService', () => {
  let redis: Redis;
  let service: RedisCacheService;

  beforeEach(() => {
    redis = new RedisMock() as unknown as Redis;
    service = new RedisCacheService(redis);
  });

  afterEach(async () => {
    await redis.quit();
  });

  it('should set and get a value', async () => {
    await service.set('test:key', 'value123');
    const result = await service.get('test:key');
    expect(result).toBe('value123');
  });

  it('should return null for non-existent key', async () => {
    const result = await service.get('test:nonexistent');
    expect(result).toBeNull();
  });

  it('should delete a key', async () => {
    await service.set('test:del', 'value');
    await service.delete('test:del');
    const result = await service.get('test:del');
    expect(result).toBeNull();
  });

  it('should check if key exists', async () => {
    await service.set('test:exists', 'value');
    const exists = await service.exists('test:exists');
    expect(exists).toBe(true);

    const notExists = await service.exists('test:missing');
    expect(notExists).toBe(false);
  });

  it('should increment a key', async () => {
    await service.increment('test:inc');
    await service.increment('test:inc');
    const val = await service.get('test:inc');
    expect(val).toBe('2');
  });
});
