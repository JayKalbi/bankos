import * as crypto from 'crypto';
import { RefreshTokenService } from '../../../../src/modules/auth/services/RefreshTokenService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { ITokenService } from '../../../../src/modules/auth/interfaces/ITokenService';
import { IDeviceSessionRepository } from '../../../../src/modules/auth/interfaces/IDeviceSessionRepository';
import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { DeviceSession } from '../../../../src/core/domain/DeviceSession';
import { User } from '../../../../src/core/domain/User';

describe('RefreshTokenService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let deviceSessionRepository: jest.Mocked<IDeviceSessionRepository>;
  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let clock: jest.Mocked<IClock>;
  let refreshTokenService: RefreshTokenService;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      decode: jest.fn(),
    };

    deviceSessionRepository = {
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findActiveSessions: jest.fn(),
      save: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    eventDispatcher = {
      dispatch: jest.fn(),
    };

    randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn((val) => crypto.createHash('sha256').update(val).digest('hex'))
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    refreshTokenService = new RefreshTokenService(
      userRepository,
      tokenService,
      deviceSessionRepository,
      eventDispatcher,
      randomGenerator,
      clock
    );
  });

  const createMockSession = (refreshTokenStr: string, isRevoked = false, expiresAt = new Date('2026-02-01T00:00:00.000Z')) => {
    const hash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    return new DeviceSession(
      'session-id',
      'user-id',
      hash,
      '127.0.0.1',
      'Jest',
      expiresAt,
      new Date('2026-01-01T00:00:00.000Z'),
      isRevoked
    );
  };

  it('should successfully rotate tokens', async () => {
    const request = {
      refreshToken: 'valid-refresh-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const session = createMockSession('valid-refresh-token');
    const user = new User('user-id', 'test@test.com', 'hash', ['user']);

    tokenService.verifyRefreshToken.mockReturnValue({ sessionId: 'session-id' });
    deviceSessionRepository.findById.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);
    tokenService.generateAccessToken.mockReturnValue('new-access');
    tokenService.generateRefreshToken.mockReturnValue('new-refresh');
    tokenService.decode.mockReturnValue({ exp: 1767225600 + 3600 });

    const response = await refreshTokenService.execute(request);

    expect(response.accessToken).toBe('new-access');
    expect(response.refreshToken).toBe('new-refresh');
    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1); // TokenRotated
  });

  it('should detect replay and revoke session', async () => {
    const request = {
      refreshToken: 'old-refresh-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    // DB has a DIFFERENT hash (simulating token was already rotated)
    const session = createMockSession('current-refresh-token');
    
    tokenService.verifyRefreshToken.mockReturnValue({ sessionId: 'session-id' });
    deviceSessionRepository.findById.mockResolvedValue(session);

    await expect(refreshTokenService.execute(request)).rejects.toThrow('Token replay detected');
    
    expect(session.isRevoked).toBe(true);
    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1); // TokenRevoked audit event
  });

  it('should reject expired refresh token', async () => {
    const request = {
      refreshToken: 'valid-refresh-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const session = createMockSession('valid-refresh-token', false, new Date('2025-12-31T23:59:59.000Z'));
    
    tokenService.verifyRefreshToken.mockReturnValue({ sessionId: 'session-id' });
    deviceSessionRepository.findById.mockResolvedValue(session);

    await expect(refreshTokenService.execute(request)).rejects.toThrow('Session expired');
  });

  it('should reject revoked session', async () => {
    const request = {
      refreshToken: 'valid-refresh-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const session = createMockSession('valid-refresh-token', true);
    
    tokenService.verifyRefreshToken.mockReturnValue({ sessionId: 'session-id' });
    deviceSessionRepository.findById.mockResolvedValue(session);

    await expect(refreshTokenService.execute(request)).rejects.toThrow('Session is revoked');
  });
});
