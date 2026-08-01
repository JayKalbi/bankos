import * as crypto from 'crypto';
import { ResetPasswordService } from '../../../../src/modules/auth/services/ResetPasswordService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IPasswordResetTokenRepository } from '../../../../src/modules/auth/interfaces/IPasswordResetTokenRepository';
import { IPasswordHasher } from '../../../../src/modules/auth/interfaces/IPasswordHasher';
import { IDeviceSessionRepository } from '../../../../src/modules/auth/interfaces/IDeviceSessionRepository';
import { ITokenBlacklistService } from '../../../../src/modules/auth/interfaces/ITokenBlacklistService';
import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { User } from '../../../../src/core/domain/User';
import { PasswordResetToken } from '../../../../src/core/domain/PasswordResetToken';
import { DeviceSession } from '../../../../src/core/domain/DeviceSession';

describe('ResetPasswordService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let deviceSessionRepository: jest.Mocked<IDeviceSessionRepository>;
  let tokenBlacklistService: jest.Mocked<ITokenBlacklistService>;
  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let clock: jest.Mocked<IClock>;
  let resetPasswordService: ResetPasswordService;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    passwordResetTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      delete: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
      verify: jest.fn(),
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

    resetPasswordService = new ResetPasswordService(
      userRepository,
      passwordResetTokenRepository,
      passwordHasher,
      deviceSessionRepository,
      tokenBlacklistService,
      eventDispatcher,
      randomGenerator,
      clock
    );
  });

  const createMockToken = (tokenValue: string, isUsed = false, expiresAt = new Date('2030-02-01T00:00:00.000Z')) => {
    return new PasswordResetToken(tokenValue, 'user-id', expiresAt, isUsed);
  };

  it('should successfully reset password, delete token, and revoke old sessions', async () => {
    const rawToken = 'valid-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const request = {
      token: rawToken,
      newPasswordRaw: 'ValidPassw0rd!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const resetToken = createMockToken(hashedToken);
    const user = new User('user-id', 'test@example.com', 'old-hash');
    const session = new DeviceSession('session-1', 'user-id', 'hash', '127.0.0.1', 'Jest', new Date('2026-02-01T00:00:00.000Z'), new Date('2026-01-01T00:00:00.000Z'), false);

    passwordResetTokenRepository.findByToken.mockResolvedValue(resetToken);
    userRepository.findById.mockResolvedValue(user);
    deviceSessionRepository.findActiveSessions.mockResolvedValue([session]);

    await resetPasswordService.execute(request);

    expect(passwordResetTokenRepository.findByToken).toHaveBeenCalledWith(hashedToken);
    expect(user.passwordHash).toBe('new-hash');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(passwordResetTokenRepository.delete).toHaveBeenCalledWith(hashedToken);
    
    expect(session.isRevoked).toBe(true);
    expect(deviceSessionRepository.save).toHaveBeenCalledWith(session);
    
    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(2); // PasswordChanged, TokenRevoked
  });

  it('should reject non-existent token', async () => {
    const request = {
      token: 'invalid-token',
      newPasswordRaw: 'ValidPassw0rd!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    passwordResetTokenRepository.findByToken.mockResolvedValue(null);

    await expect(resetPasswordService.execute(request)).rejects.toThrow('Invalid or expired reset token');
  });

  it('should reject expired token', async () => {
    const rawToken = 'expired-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const request = {
      token: rawToken,
      newPasswordRaw: 'ValidPassw0rd!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const resetToken = createMockToken(hashedToken, false, new Date('2025-12-31T23:59:59.000Z'));
    passwordResetTokenRepository.findByToken.mockResolvedValue(resetToken);

    await expect(resetPasswordService.execute(request)).rejects.toThrow('Invalid or expired reset token');
  });

  it('should reject used token', async () => {
    const rawToken = 'used-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const request = {
      token: rawToken,
      newPasswordRaw: 'ValidPassw0rd!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const resetToken = createMockToken(hashedToken, true);
    passwordResetTokenRepository.findByToken.mockResolvedValue(resetToken);

    await expect(resetPasswordService.execute(request)).rejects.toThrow('Invalid or expired reset token');
  });
});
