import * as crypto from 'crypto';
import { VerifyEmailService } from '../../../../src/modules/auth/services/VerifyEmailService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IEmailVerificationTokenRepository } from '../../../../src/modules/auth/interfaces/IEmailVerificationTokenRepository';
import { IAuditRepository } from '../../../../src/modules/auth/interfaces/IAuditRepository';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { User } from '../../../../src/core/domain/User';
import { EmailVerificationToken } from '../../../../src/core/domain/EmailVerificationToken';

describe('VerifyEmailService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let emailVerificationTokenRepository: jest.Mocked<IEmailVerificationTokenRepository>;
  let auditRepository: jest.Mocked<IAuditRepository>;
  let clock: jest.Mocked<IClock>;
  let verifyEmailService: VerifyEmailService;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    emailVerificationTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      delete: jest.fn(),
    };

    auditRepository = {
      save: jest.fn(),
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    verifyEmailService = new VerifyEmailService(
      userRepository,
      emailVerificationTokenRepository,
      auditRepository,
      clock
    );
  });

  const createMockToken = (tokenValue: string, isUsed = false, expiresAt = new Date('2030-02-01T00:00:00.000Z')) => {
    return new EmailVerificationToken(tokenValue, 'user-id', expiresAt, isUsed);
  };

  it('should successfully verify email, delete token, and record audit event', async () => {
    const rawToken = 'valid-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const request = {
      token: rawToken,
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const verifyToken = createMockToken(hashedToken);
    const user = new User('user-id', 'test@example.com', 'hash', [], false, 0, false);

    emailVerificationTokenRepository.findByToken.mockResolvedValue(verifyToken);
    userRepository.findById.mockResolvedValue(user);

    await verifyEmailService.execute(request);

    expect(emailVerificationTokenRepository.findByToken).toHaveBeenCalledWith(hashedToken);
    expect(user.emailVerified).toBe(true);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailVerificationTokenRepository.delete).toHaveBeenCalledWith(hashedToken);
    
    expect(auditRepository.save).toHaveBeenCalledTimes(1); // EmailVerified event
  });

  it('should reject non-existent token', async () => {
    const request = {
      token: 'invalid-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    emailVerificationTokenRepository.findByToken.mockResolvedValue(null);

    await expect(verifyEmailService.execute(request)).rejects.toThrow('Invalid or expired verification token');
  });

  it('should reject expired token', async () => {
    const rawToken = 'expired-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const request = {
      token: rawToken,
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const verifyToken = createMockToken(hashedToken, false, new Date('2025-12-31T23:59:59.000Z'));
    emailVerificationTokenRepository.findByToken.mockResolvedValue(verifyToken);

    await expect(verifyEmailService.execute(request)).rejects.toThrow('Invalid or expired verification token');
  });

  it('should reject used token', async () => {
    const rawToken = 'used-token';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const request = {
      token: rawToken,
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const verifyToken = createMockToken(hashedToken, true);
    emailVerificationTokenRepository.findByToken.mockResolvedValue(verifyToken);

    await expect(verifyEmailService.execute(request)).rejects.toThrow('Invalid or expired verification token');
  });
});
