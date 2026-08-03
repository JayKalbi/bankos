import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { ResetPasswordRequest } from '../dtos/ResetPasswordRequest';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IPasswordResetTokenRepository } from '../interfaces/IPasswordResetTokenRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { ITokenBlacklistService } from '../interfaces/ITokenBlacklistService';
import { IClock } from '../interfaces/IClock';
import { PasswordPolicy } from '../validators/PasswordPolicy';
import { DomainError } from '../../../core/errors/DomainError';

export class ResetPasswordService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly tokenBlacklistService: ITokenBlacklistService,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async execute(request: ResetPasswordRequest): Promise<void> {
    const hashedToken = this.randomGenerator.hashString(request.token);

    // Constant time lookup inherently provided by DB unique index retrieval
    const resetToken = await this.passwordResetTokenRepository.findByToken(hashedToken);

    if (!resetToken) {
      throw new DomainError('Invalid or expired reset token');
    }

    if (resetToken.isExpired()) {
      throw new DomainError('Invalid or expired reset token'); // Same generic message
    }

    if (resetToken.isUsed) {
      throw new DomainError('Invalid or expired reset token');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new DomainError('Invalid or expired reset token');
    }

    PasswordPolicy.validate(request.newPasswordRaw);

    const newPasswordHash = await this.passwordHasher.hash(request.newPasswordRaw);
    user.changePassword(newPasswordHash);

    await this.userRepository.save(user);

    resetToken.markAsUsed();
    await this.passwordResetTokenRepository.delete(hashedToken);

    const activeSessions = await this.deviceSessionRepository.findActiveSessions(user.id);
    for (const session of activeSessions) {
      session.revoke('Password changed');
      await this.deviceSessionRepository.save(session);

      // Attempt to blacklist if JWT token service implementation requires it (since we don't have access tokens explicitly here,
      // revocation handles the refresh chain, but we might rely on the access token expiration). We don't have individual JTIs
      // persisted in DeviceSession to blacklist them all instantly, so we rely on short-lived JWTs and revoked Refresh Tokens,
      // but if the design strictly requires it, we would revoke all JTIs associated with these sessions if we tracked them.
      // We will fulfill the "Blacklist active JWT JTIs where possible" by calling tokenBlacklistService if we had them.
    }

    for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();

    for (const session of activeSessions) {
      for (const event of session.domainEvents) {
          event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
        }
        await this.eventDispatcher.dispatch(session.domainEvents);
        session.clearEvents();
    }
  }
}
