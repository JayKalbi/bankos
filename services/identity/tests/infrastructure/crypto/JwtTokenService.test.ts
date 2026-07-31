import { JwtTokenService } from '../../../src/infrastructure/crypto/JwtTokenService';
import { config } from '../../../src/config';

describe('JwtTokenService', () => {
  const tokenService = new JwtTokenService();
  const payload = { role: 'user' };
  const subject = 'user-123';

  it('should generate and verify an access token', () => {
    const token = tokenService.generateAccessToken(payload, subject);
    expect(token).toBeDefined();

    const decoded = tokenService.verifyAccessToken<any>(token);
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe(subject);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.iss).toBe(config.jwt.issuer);
    expect(decoded.aud).toBe(config.jwt.audience);
    expect(decoded.jti).toBeDefined();
  });

  it('should generate and verify a refresh token', () => {
    const token = tokenService.generateRefreshToken(payload, subject);
    expect(token).toBeDefined();

    const decoded = tokenService.verifyRefreshToken<any>(token);
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe(subject);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.iss).toBe(config.jwt.issuer);
    expect(decoded.aud).toBe(config.jwt.audience);
    expect(decoded.jti).toBeDefined();
  });

  it('should decode token without verification', () => {
    const token = tokenService.generateAccessToken(payload, subject);
    const decoded = tokenService.decode<any>(token);

    expect(decoded).toBeDefined();
    expect(decoded?.sub).toBe(subject);
    expect(decoded?.role).toBe(payload.role);
  });

  it('should throw error when verifying invalid token', () => {
    expect(() => {
      tokenService.verifyAccessToken('invalid.token.string');
    }).toThrow();
  });
});
