export interface ITokenBlacklistService {
  blacklistToken(jti: string, ttlSeconds: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
  remove(jti: string): Promise<void>;
}
