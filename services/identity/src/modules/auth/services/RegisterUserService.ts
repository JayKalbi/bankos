import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { RegisterUserRequest } from '../dtos/RegisterUserRequest';
import { RegisterUserResponse } from '../dtos/RegisterUserResponse';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IRoleRepository } from '../interfaces/IRoleRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IClock } from '../interfaces/IClock';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { EmailValidator } from '../validators/EmailValidator';
import { PasswordPolicy } from '../validators/PasswordPolicy';
import { DomainError } from '../../../core/errors/DomainError';
import { User } from '../../../core/domain/User';
import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export class RegisterUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly emailTokenRepository: IEmailVerificationTokenRepository,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly clock: IClock
  ) {}

  public async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const normalizedEmail = EmailValidator.normalize(request.email);

    if (!EmailValidator.isValid(normalizedEmail)) {
      throw new DomainError('Invalid email format');
    }

    if (!PasswordPolicy.validate(request.passwordRaw)) {
      throw new DomainError('Password does not meet policy requirements');
    }

    const emailExists = await this.userRepository.exists(normalizedEmail);
    if (emailExists) {
      throw new DomainError('Email is already registered');
    }

    const defaultRole = await this.roleRepository.findByName('user');
    if (!defaultRole) {
      throw new DomainError('Default role not found');
    }

    const passwordHash = await this.passwordHasher.hash(request.passwordRaw);

    const user = new User(
      this.randomGenerator.generateUUID(),
      normalizedEmail,
      passwordHash,
      false,
      0,
      false,
      true
    );

    await this.userRepository.save(user);
    await this.userRepository.assignRole(user.id, defaultRole.name);

    const tokenRaw = this.randomGenerator.generateToken(32);
    const tokenHash = this.randomGenerator.hashString(tokenRaw);
    const expiresAt = new Date(this.clock.now().getTime() + 24 * 60 * 60 * 1000);

    const verificationToken = new EmailVerificationToken(
      tokenHash,
      user.id,
      expiresAt,
      false
    );

    await this.emailTokenRepository.save(verificationToken);

    for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();

    return {
      id: user.id,
      email: user.email,
    };
  }
}
