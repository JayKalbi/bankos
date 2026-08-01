import { ForgotPasswordRequest } from '../dtos/ForgotPasswordRequest';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IPasswordResetTokenRepository } from '../interfaces/IPasswordResetTokenRepository';
import { IMailer } from '../interfaces/IMailer';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IClock } from '../interfaces/IClock';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { EmailValidator } from '../validators/EmailValidator';
import { PasswordResetToken } from '../../../core/domain/PasswordResetToken';
import { DomainError } from '../../../core/errors/DomainError';

export class ForgotPasswordService {
  private readonly TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly mailer: IMailer,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(request: ForgotPasswordRequest): Promise<void> {
    const normalizedEmail = EmailValidator.normalize(request.email);
    if (!EmailValidator.isValid(normalizedEmail)) {
      throw new DomainError('Invalid email format');
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);

    // We ALWAYS return generic success (void return) to prevent email enumeration.
    if (!user) {
      // Intentionally do nothing to prevent revealing non-existent email
      return;
    }

    const rawToken = this.randomGenerator.generateToken(32);
    const hashedToken = this.randomGenerator.hashString(rawToken);
    const expiresAt = new Date(this.clock.now().getTime() + this.TOKEN_EXPIRATION_MS);

    const resetToken = new PasswordResetToken(
      hashedToken,
      user.id,
      expiresAt
    );

    await this.passwordResetTokenRepository.save(resetToken);

    await this.mailer.sendPasswordReset(user.email, rawToken);

    for (const event of resetToken.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(resetToken.domainEvents);
    resetToken.clearEvents();
  }
}
