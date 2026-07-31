import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ITokenService } from '../../modules/auth/interfaces/ITokenService';
import { config } from '../../config';

export class JwtTokenService implements ITokenService {
  public generateAccessToken(payload: Record<string, unknown>, subject: string): string {
    return this.sign(payload, subject, config.jwt.accessExpiration);
  }

  public generateRefreshToken(payload: Record<string, unknown>, subject: string): string {
    return this.sign(payload, subject, config.jwt.refreshExpiration);
  }

  public verifyAccessToken<T>(token: string): T {
    return this.verify<T>(token);
  }

  public verifyRefreshToken<T>(token: string): T {
    return this.verify<T>(token);
  }

  public decode<T>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }

  private sign(payload: Record<string, unknown>, subject: string, expiresIn: string): string {
    return jwt.sign(payload, config.jwt.secret, {
      algorithm: 'HS256',
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      subject,
      jwtid: crypto.randomUUID(),
    });
  }

  private verify<T>(token: string): T {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as T;
  }
}
