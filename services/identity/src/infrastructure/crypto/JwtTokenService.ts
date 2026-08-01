import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ITokenService } from '../../modules/auth/interfaces/ITokenService';
import { config } from '../../config';
import { KeyManager } from './keys/KeyManager';

export class JwtTokenService implements ITokenService {
  constructor(private readonly keyManager: KeyManager) {}

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
    const activeKeyId = this.keyManager.getActiveKeyId();
    const activeKey = this.keyManager.getActiveKey();

    return jwt.sign(payload, activeKey.privateKey as string, {
      algorithm: 'RS256',
      keyid: activeKeyId,
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      subject,
      jwtid: crypto.randomUUID(),
    });
  }

  private verify<T>(token: string): T {
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.header) {
      throw new Error('Invalid token structure');
    }

    const kid = decoded.header.kid;
    if (!kid) {
      throw new Error('Missing kid in JWT header');
    }

    const key = this.keyManager.getKey(kid);
    if (!key) {
      throw new Error(`Unknown kid: ${kid}`);
    }

    return jwt.verify(token, key.publicKey, {
      algorithms: ['RS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as T;
  }
}
