import * as crypto from 'crypto';
import { ForgotPasswordService } from '../../../../src/modules/auth/services/ForgotPasswordService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IPasswordResetTokenRepository } from '../../../../src/modules/auth/interfaces/IPasswordResetTokenRepository';
import { IMailer } from '../../../../src/modules/auth/interfaces/IMailer';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { IAuditRepository } from '../../../../src/modules/auth/interfaces/IAuditRepository';
import { User } from '../../../../src/core/domain/User';
import { PasswordResetToken } from '../../../../src/core/domain/PasswordResetToken';

describe('ForgotPasswordService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let mailer: jest.Mocked<IMailer>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let clock: jest.Mocked<IClock>;
  let auditRepository: jest.Mocked<IAuditRepository>;
  let forgotPasswordService: ForgotPasswordService;

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

    mailer = {
      sendPasswordReset: jest.fn(),
      sendVerificationEmail: jest.fn(),
    };

    randomGenerator = {
      generateToken: jest.fn().mockReturnValue('72616e646f6d2d62797465732d6d6f636b'), // hex of 'random-bytes-mock'
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    auditRepository = {
      save: jest.fn(),
    };

    forgotPasswordService = new ForgotPasswordService(
      userRepository,
      passwordResetTokenRepository,
      mailer,
      randomGenerator,
      clock,
      auditRepository
    );
  });

  it('should successfully initiate forgot password for existing user', async () => {
    const request = {
      email: 'TEST@example.com',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = new User('user-id', 'test@example.com', 'hash');
    userRepository.findByEmail.mockResolvedValue(user);

    await forgotPasswordService.execute(request);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(randomGenerator.generateToken).toHaveBeenCalledWith(32);
    
    // Check if hashed token is saved
    const rawToken = '72616e646f6d2d62797465732d6d6f636b'; // hex of 'random-bytes-mock'
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    expect(passwordResetTokenRepository.save).toHaveBeenCalledTimes(1);
    const savedToken: PasswordResetToken = passwordResetTokenRepository.save.mock.calls[0][0];
    expect(savedToken.token).toBe(expectedHash);
    expect(savedToken.userId).toBe('user-id');
    expect(savedToken.expiresAt).toEqual(new Date('2026-01-01T00:15:00.000Z')); // 15 mins later

    expect(mailer.sendPasswordReset).toHaveBeenCalledWith('test@example.com', rawToken);
    expect(auditRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should return successfully without action for non-existent user to prevent enumeration', async () => {
    const request = {
      email: 'nonexistent@example.com',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    userRepository.findByEmail.mockResolvedValue(null);

    await forgotPasswordService.execute(request);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(passwordResetTokenRepository.save).not.toHaveBeenCalled();
    expect(mailer.sendPasswordReset).not.toHaveBeenCalled();
    expect(auditRepository.save).not.toHaveBeenCalled();
  });
});
