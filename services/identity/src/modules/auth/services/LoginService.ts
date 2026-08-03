import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { LoginRequest } from '../dtos/LoginRequest';
import { LoginResponse } from '../dtos/LoginResponse';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { ITokenService } from '../interfaces/ITokenService';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { IClock } from '../interfaces/IClock';
import { EmailValidator } from '../validators/EmailValidator';
import { DomainError } from '../../../core/errors/DomainError';
import { DeviceSession } from '../../../core/domain/DeviceSession';
import { AuthorizationEngine } from '../engine/AuthorizationEngine';

export class LoginService {
  private static readonly DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$GKA/RZv83E8zMBbJ2CVpao0uZQWlLWfwBWo';

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock,
    private readonly authEngine: AuthorizationEngine
  ) {}

  public async execute(request: LoginRequest): Promise<LoginResponse> {
    const normalizedEmail = EmailValidator.normalize(request.email);

    if (!EmailValidator.isValid(normalizedEmail)) {
      await this.passwordHasher.verify(LoginService.DUMMY_HASH, request.passwordRaw);
      throw new DomainError('Invalid credentials');
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      await this.passwordHasher.verify(LoginService.DUMMY_HASH, request.passwordRaw);
      throw new DomainError('Invalid credentials');
    }

    if (user.isLocked) {
      await this.passwordHasher.verify(user.passwordHash, request.passwordRaw);
      throw new DomainError('Invalid credentials');
    }

    const isValidPassword = await this.passwordHasher.verify(user.passwordHash, request.passwordRaw);

    if (!isValidPassword) {
      user.incrementFailedAttempts(5);
      await this.userRepository.update(user);
      throw new DomainError('Invalid credentials');
    }

    user.recordLogin(request.ipAddress, request.userAgent);
    await this.userRepository.update(user);

    const directRoles = await this.userRepository.findRoles(user.id);
    const effectiveRoles = await this.authEngine.resolveRoles(directRoles);
    const effectivePermissions = await this.authEngine.resolvePermissions(directRoles);

    const sessionId = this.randomGenerator.generateUUID();
    const payload = {
      roles: effectiveRoles,
      permissions: effectivePermissions,
      sessionId,
      tokenVersion: 1,
      tenantId: 'default'
    };

    const accessToken = this.tokenService.generateAccessToken(payload, user.id);
    const refreshToken = this.tokenService.generateRefreshToken(payload, user.id);

    const decodedRefresh = this.tokenService.decode<{ exp: number }>(refreshToken);
    const expiresAt = decodedRefresh && decodedRefresh.exp
      ? new Date(decodedRefresh.exp * 1000)
      : new Date(this.clock.now().getTime() + 7 * 24 * 60 * 60 * 1000);

    const hashedRefreshToken = this.randomGenerator.hashString(refreshToken);

    const deviceSession = new DeviceSession(
      sessionId,
      user.id,
      hashedRefreshToken,
      request.ipAddress,
      request.userAgent,
      expiresAt,
      this.clock.now(),
      false
    );

    await this.deviceSessionRepository.save(deviceSession);

    for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();

    return {
      accessToken,
      refreshToken
    };
  }
}
