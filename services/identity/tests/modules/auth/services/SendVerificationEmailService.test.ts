import * as crypto from 'crypto';
import { SendVerificationEmailService } from '../../../../src/modules/auth/services/SendVerificationEmailService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IEmailVerificationTokenRepository } from '../../../../src/modules/auth/interfaces/IEmailVerificationTokenRepository';
import { IMailer } from '../../../../src/modules/auth/interfaces/IMailer';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { User } from '../../../../src/core/domain/User';
import { EmailVerificationToken } from '../../../../src/core/domain/EmailVerificationToken';

describe('SendVerificationEmailService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let emailVerificationTokenRepository: jest.Mocked<IEmailVerificationTokenRepository>;
  let mailer: jest.Mocked<IMailer>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let clock: jest.Mocked<IClock>;
  let sendVerificationEmailService: SendVerificationEmailService;

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

    mailer = {
      sendPasswordReset: jest.fn(),
      sendVerificationEmail: jest.fn(),
    };

    randomGenerator = {
      generateToken: jest.fn().mockReturnValue('72616e646f6d2d62797465732d6d6f636b'), // hex
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn((val) => crypto.createHash('sha256').update(val).digest('hex'))
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    sendVerificationEmailService = new SendVerificationEmailService(
      userRepository,
      emailVerificationTokenRepository,
      mailer,
      randomGenerator,
      clock
    );
  });

  it('should successfully initiate email verification for existing unverified user', async () => {
    const user = new User('user-id', 'test@example.com', 'hash', [], false, 0, false);
    userRepository.findByEmail.mockResolvedValue(user);

    await sendVerificationEmailService.execute('TEST@example.com');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(randomGenerator.generateToken).toHaveBeenCalledWith(32);
    
    // Check if hashed token is saved
    const rawToken = '72616e646f6d2d62797465732d6d6f636b';
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    expect(emailVerificationTokenRepository.save).toHaveBeenCalledTimes(1);
    const savedToken: EmailVerificationToken = emailVerificationTokenRepository.save.mock.calls[0][0];
    expect(savedToken.token).toBe(expectedHash);
    expect(savedToken.userId).toBe('user-id');
    expect(savedToken.expiresAt).toEqual(new Date('2026-01-02T00:00:00.000Z')); // 24 hours later

    expect(mailer.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', rawToken);
  });

  it('should return successfully without action for already verified user', async () => {
    const user = new User('user-id', 'test@example.com', 'hash', [], false, 0, true);
    userRepository.findByEmail.mockResolvedValue(user);

    await sendVerificationEmailService.execute('test@example.com');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(emailVerificationTokenRepository.save).not.toHaveBeenCalled();
    expect(mailer.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should return successfully without action for non-existent user to prevent enumeration', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await sendVerificationEmailService.execute('nonexistent@example.com');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(emailVerificationTokenRepository.save).not.toHaveBeenCalled();
    expect(mailer.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
