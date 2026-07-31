export interface ITokenService {
  generateAccessToken(payload: Record<string, unknown>, subject: string): string;
  generateRefreshToken(payload: Record<string, unknown>, subject: string): string;
  verifyAccessToken<T>(token: string): T;
  verifyRefreshToken<T>(token: string): T;
  decode<T>(token: string): T | null;
}
