export interface IRateLimitService {
  incrementAttempts(key: string, ttlSeconds: number): Promise<number>;
  resetAttempts(key: string): Promise<void>;
  getAttempts(key: string): Promise<number>;
}
