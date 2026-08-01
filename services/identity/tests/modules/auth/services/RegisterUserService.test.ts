import { RegisterUserService } from '../../../../src/modules/auth/services/RegisterUserService';
import { IUserRepository } from '../../../../src/modules/auth/interfaces/IUserRepository';
import { IRoleRepository } from '../../../../src/modules/auth/interfaces/IRoleRepository';
import { IPasswordHasher } from '../../../../src/modules/auth/interfaces/IPasswordHasher';
import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../../src/modules/auth/interfaces/IClock';
import { IEmailVerificationTokenRepository } from '../../../../src/modules/auth/interfaces/IEmailVerificationTokenRepository';
import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';
import { DomainError } from '../../../../src/core/errors/DomainError';
import { Role } from '../../../../src/core/domain/Role';
import { User } from '../../../../src/core/domain/User';

describe('RegisterUserService', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let randomGenerator: jest.Mocked<IRandomGenerator>;
  let emailTokenRepository: jest.Mocked<IEmailVerificationTokenRepository>;
  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;
  let clock: jest.Mocked<IClock>;
  let registerUserService: RegisterUserService;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    roleRepository = {
      findByName: jest.fn(),
      findManyByNames: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };

    emailTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      delete: jest.fn(),
    };

    eventDispatcher = {
      dispatch: jest.fn(),
    };

    clock = {
      now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      unix: jest.fn().mockReturnValue(1767225600),
    };

    registerUserService = new RegisterUserService(
      userRepository,
      roleRepository,
      passwordHasher,
      randomGenerator,
      emailTokenRepository,
      eventDispatcher,
      clock
    );
  });

  it('should successfully register a user', async () => {
    const request = {
      email: ' Test@Example.com ', // Should normalize
      passwordRaw: 'StrongPass123!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    userRepository.exists.mockResolvedValue(false);
    roleRepository.findByName.mockResolvedValue(new Role('role-id', 'user'));
    passwordHasher.hash.mockResolvedValue('hashed-password');
    randomGenerator.generateToken.mockReturnValue('random-token');

    const response = await registerUserService.execute(request);

    expect(response.email).toBe('test@example.com');
    expect(response.id).toBeDefined();

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0][0] as User;
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.roles).toContain('user');

    expect(emailTokenRepository.save).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should throw DomainError for duplicate email', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'StrongPass123!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    userRepository.exists.mockResolvedValue(true);

    await expect(registerUserService.execute(request)).rejects.toThrow(DomainError);
    await expect(registerUserService.execute(request)).rejects.toThrow('Email is already registered');
  });

  it('should throw DomainError for invalid email', async () => {
    const request = {
      email: 'invalid-email',
      passwordRaw: 'StrongPass123!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    await expect(registerUserService.execute(request)).rejects.toThrow(DomainError);
    await expect(registerUserService.execute(request)).rejects.toThrow('Invalid email format');
  });

  it('should throw DomainError for weak password', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'weak',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    await expect(registerUserService.execute(request)).rejects.toThrow(DomainError);
    await expect(registerUserService.execute(request)).rejects.toThrow('Password does not meet policy requirements');
  });

  it('should propagate repository failures', async () => {
    const request = {
      email: 'test@example.com',
      passwordRaw: 'StrongPass123!',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
    };

    userRepository.exists.mockResolvedValue(false);
    roleRepository.findByName.mockResolvedValue(new Role('role-id', 'user'));
    passwordHasher.hash.mockResolvedValue('hashed-password');
    userRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(registerUserService.execute(request)).rejects.toThrow('Database error');
  });
});
