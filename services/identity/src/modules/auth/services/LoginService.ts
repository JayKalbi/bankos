import * as crypto from 'crypto';
import { LoginRequest } from '../dtos/LoginRequest';
import { LoginResponse } from '../dtos/LoginResponse';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { ITokenService } from '../interfaces/ITokenService';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { IClock } from '../interfaces/IClock';
import { EmailValidator } from '../validators/EmailValidator';
import { DomainError } from '../../../core/errors/DomainError';
import { DeviceSession } from '../../../core/domain/DeviceSession';
import { UserLoggedIn } from '../../../core/events/UserLoggedIn';
import { AuditEvent } from '../../../core/domain/AuditEvent';

export class LoginService {
  // A dummy valid Argon2id hash to mitigate timing attacks when user is not found.
  private static readonly DUMMY_HASH = '$argon2id$v=19$m=65536,p=4,t=3$0CmA3tRm9KA7oAO1oX+GKA$ln1QhJ9m0df+RZv83E8zMBbJ2CVpao0uZQWlLWfwBWo';

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly clock: IClock
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

    const sessionId = crypto.randomUUID();
    const payload = {
      roles: user.roles,
      sessionId
    };

    const accessToken = this.tokenService.generateAccessToken(payload, user.id);
    const refreshToken = this.tokenService.generateRefreshToken(payload, user.id);

    const decodedRefresh = this.tokenService.decode<{ exp: number }>(refreshToken);
    const expiresAt = decodedRefresh && decodedRefresh.exp
      ? new Date(decodedRefresh.exp * 1000)
      : new Date(this.clock.now().getTime() + 7 * 24 * 60 * 60 * 1000);

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

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
      if (event instanceof UserLoggedIn) {
        const auditEvent = new AuditEvent(
          crypto.randomUUID(),
          'UserLoggedIn',
          user.id,
          { ipAddress: request.ipAddress, userAgent: request.userAgent },
          request.ipAddress,
          request.userAgent,
          this.clock.now()
        );
        await this.auditRepository.save(auditEvent);
      }
    }
    user.clearEvents();

    return {
      accessToken,
      refreshToken
    };
  }
}
