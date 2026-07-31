import { LoginService } from '../../../../src/modules/auth/services/LoginService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IPasswordHasher } from '../../../../src/modules/auth/interfaces/IPasswordHasher';
import { ITokenService } from '../../../../src/modules/auth/interfaces/ITokenService';
import { IDeviceSessionRepository } from '../../../../src/modules/auth/interfaces/IDeviceSessionRepository';
import { IAuditRepository } from '../../../../src/modules/auth/interfaces/IAuditRepository';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { DomainError } from '../../../../src/core/errors/DomainError';
import { User } from '../../../../src/core/domain/User';

describe('LoginService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<ITokenService>;
  let deviceSessionRepository: jest.Mocked<IDeviceSessionRepository>;
  let auditRepository: jest.Mocked<IAuditRepository>;
  let clock: jest.Mocked<IClock>;
  let loginService: LoginService;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
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

    auditRepository = {
      save: jest.fn(),
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    loginService = new LoginService(
      userRepository,
      passwordHasher,
      tokenService,
      deviceSessionRepository,
      auditRepository,
      clock
    );
  });

  const createMockUser = (isLocked = false, failedLoginAttempts = 0) => {
    return new User(
      'user-id',
      'test@example.com',
      'hashed-password',
      ['user'],
      isLocked,
      failedLoginAttempts,
      true,
      false
    );
  };

  it('should successfully login and issue tokens', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'CorrectPass123',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = createMockUser();
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    tokenService.decode.mockReturnValue({ exp: 1767225600 + 3600 }); // +1 hour

    const response = await loginService.execute(request);

    expect(response.accessToken).toBe('access-token');
    expect(response.refreshToken).toBe('refresh-token');

    expect(userRepository.update).toHaveBeenCalledTimes(1);
    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);
    expect(auditRepository.save).toHaveBeenCalledTimes(1); // UserLoggedIn event
  });

  it('should throw DomainError and do dummy verify if user not found', async () => {
    const request = {
      email: 'notfound@example.com',
      passwordRaw: 'CorrectPass123',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(loginService.execute(request)).rejects.toThrow('Invalid credentials');

    // Should have called verify with dummy hash
    expect(passwordHasher.verify).toHaveBeenCalledWith(expect.stringContaining('$argon2id$'), request.passwordRaw);
  });

  it('should throw DomainError for wrong password and increment failed attempts', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'WrongPass',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = createMockUser(false, 0);
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(loginService.execute(request)).rejects.toThrow('Invalid credentials');

    expect(userRepository.update).toHaveBeenCalledTimes(1);
    const updatedUser = userRepository.update.mock.calls[0][0];
    expect(updatedUser.failedLoginAttempts).toBe(1);
  });

  it('should lock account after threshold failed attempts', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'WrongPass',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = createMockUser(false, 4); // 4 previous fails, this will be 5th
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(loginService.execute(request)).rejects.toThrow('Invalid credentials');

    expect(userRepository.update).toHaveBeenCalledTimes(1);
    const updatedUser = userRepository.update.mock.calls[0][0];
    expect(updatedUser.isLocked).toBe(true);
  });

  it('should throw DomainError if account is already locked', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'CorrectPass123',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = createMockUser(true, 5);
    userRepository.findByEmail.mockResolvedValue(user);
    // Timing attack mitigation should still verify the password
    passwordHasher.verify.mockResolvedValue(true);

    await expect(loginService.execute(request)).rejects.toThrow('Invalid credentials');
    expect(passwordHasher.verify).toHaveBeenCalledWith(user.passwordHash, request.passwordRaw);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should reset failed attempts on successful login', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'CorrectPass123',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    const user = createMockUser(false, 3);
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    tokenService.decode.mockReturnValue({ exp: 1767225600 + 3600 });

    await loginService.execute(request);

    const updatedUser = userRepository.update.mock.calls[0][0];
    expect(updatedUser.failedLoginAttempts).toBe(0);
  });
});
