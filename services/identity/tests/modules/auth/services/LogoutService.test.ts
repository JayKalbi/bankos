import * as crypto from 'crypto';
import { LogoutService } from '../../../../src/modules/auth/services/LogoutService';
import { ITokenService } from '../../../../src/modules/auth/interfaces/ITokenService';
import { IDeviceSessionRepository } from '../../../../src/modules/auth/interfaces/IDeviceSessionRepository';
import { ITokenBlacklistService } from '../../../../src/modules/auth/interfaces/ITokenBlacklistService';
import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { DeviceSession } from '../../../../src/core/domain/DeviceSession';

describe('LogoutService', () => {
  let tokenService: jest.Mocked<ITokenService>;
  let deviceSessionRepository: jest.Mocked<IDeviceSessionRepository>;
  let tokenBlacklistService: jest.Mocked<ITokenBlacklistService>;
  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let clock: jest.Mocked<IClock>;
  let logoutService: LogoutService;

  beforeEach(() => {
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

    tokenBlacklistService = {
      blacklistToken: jest.fn(),
      isBlacklisted: jest.fn(),
      remove: jest.fn(),
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

    logoutService = new LogoutService(
      tokenService,
      deviceSessionRepository,
      tokenBlacklistService,
      eventDispatcher,
      randomGenerator,
      clock
    );
  });

  const createMockSession = (refreshTokenStr: string) => {
    const hash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    return new DeviceSession(
      'session-id',
      'user-id',
      hash,
      '127.0.0.1',
      'Jest',
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-01-01T00:00:00.000Z'),
      false
    );
  };

  it('should successfully logout, blacklist token and revoke session', async () => {
    const request = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    tokenService.decode.mockImplementation((token: string) => {
      if (token === 'access-token') return { jti: 'access-jti', exp: 1767225600 + 3600, sessionId: 'session-id' };
      if (token === 'refresh-token') return { sessionId: 'session-id' };
      return null;
    });

    const session = createMockSession('refresh-token');
    deviceSessionRepository.findById.mockResolvedValue(session);

    await logoutService.execute(request, '127.0.0.1', 'Jest');

    expect(tokenBlacklistService.blacklistToken).toHaveBeenCalledWith('access-jti', 3600);
    expect(session.isRevoked).toBe(true);
    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1); // UserLoggedOut
  });

  it('should throw error if session tokens are invalid', async () => {
    const request = {
      accessToken: 'access-token',
      refreshToken: 'wrong-refresh-token',
    };

    tokenService.decode.mockImplementation((token: string) => {
      if (token === 'access-token') return { jti: 'access-jti', exp: 1767225600 + 3600, sessionId: 'session-id' };
      if (token === 'wrong-refresh-token') return { sessionId: 'session-id' };
      return null;
    });

    const session = createMockSession('correct-refresh-token');
    deviceSessionRepository.findById.mockResolvedValue(session);

    await expect(logoutService.execute(request, '127.0.0.1', 'Jest')).rejects.toThrow('Invalid refresh token for session');
    
    expect(session.isRevoked).toBe(false);
  });
});
