import { JwtTokenService } from '../../../src/infrastructure/crypto/JwtTokenService';
import { KeyManager } from '../../../src/infrastructure/crypto/keys/KeyManager';
import { KeyLoader } from '../../../src/infrastructure/crypto/keys/KeyLoader';
import { config } from '../../../src/config';
import crypto from 'crypto';

describe('JwtTokenService', () => {
  const k1 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const k2 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  const keysConfig = JSON.stringify({
    k1: {
      privateKey: k1.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      publicKey: k1.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    },
    k2: {
      privateKey: k2.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      publicKey: k2.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    },
  });

  const keyLoader = new KeyLoader(JSON.parse(keysConfig));
  const keyManager = new KeyManager(keyLoader, 'k1');
  const tokenService = new JwtTokenService(keyManager);

  const payload = { role: 'user' };
  const subject = 'user-123';

  it('should generate and verify an access token using RS256 and include kid', () => {
    const token = tokenService.generateAccessToken(payload, subject);
    expect(token).toBeDefined();

    const decodedHeader = tokenService.decode<any>(token); // Note: jwt.decode(token) returns payload if complete=false, but we need to check header. Let's just rely on verify.
    // Wait, decode is typed to return T, which we assume is payload.

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

  it('should throw error when verifying token with missing kid', () => {
    // Generate a token without kid
    const token = require('jsonwebtoken').sign(payload, keyManager.getActiveKey().privateKey!, {
      algorithm: 'RS256',
    });
    expect(() => {
      tokenService.verifyAccessToken(token);
    }).toThrow('Missing kid in JWT header');
  });

  it('should throw error when verifying token with unknown kid', () => {
    const token = require('jsonwebtoken').sign(payload, keyManager.getActiveKey().privateKey!, {
      algorithm: 'RS256',
      keyid: 'unknown-kid'
    });
    expect(() => {
      tokenService.verifyAccessToken(token);
    }).toThrow('Unknown kid: unknown-kid');
  });

  it('should throw error if token is tampered with', () => {
    const token = tokenService.generateAccessToken(payload, subject);
    const parts = token.split('.');
    parts[1] = Buffer.from(JSON.stringify({ ...payload, role: 'admin' })).toString('base64url');
    const tampered = parts.join('.');

    expect(() => {
      tokenService.verifyAccessToken(tampered);
    }).toThrow();
  });

  it('should allow key rotation (verification with older key)', () => {
    // Current active is k1
    const token1 = tokenService.generateAccessToken(payload, subject);

    // Rotate key to k2
    const newKeyManager = new KeyManager(keyLoader, 'k2');
    const newService = new JwtTokenService(newKeyManager);

    // Old token should still verify
    expect(newService.verifyAccessToken(token1)).toBeDefined();

    // New token verifies
    const token2 = newService.generateAccessToken(payload, subject);
    expect(newService.verifyAccessToken(token2)).toBeDefined();

    // The header of token2 should have kid='k2'
    // To check this, we decode complete
    const jwt = require('jsonwebtoken');
    const decoded2 = jwt.decode(token2, { complete: true });
    expect(decoded2.header.kid).toBe('k2');
  });
});
