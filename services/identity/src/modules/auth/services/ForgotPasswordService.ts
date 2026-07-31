import * as crypto from 'crypto';
import { ForgotPasswordRequest } from '../dtos/ForgotPasswordRequest';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IPasswordResetTokenRepository } from '../interfaces/IPasswordResetTokenRepository';
import { IMailer } from '../interfaces/IMailer';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IClock } from '../interfaces/IClock';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { EmailValidator } from '../validators/EmailValidator';
import { PasswordResetToken } from '../../../core/domain/PasswordResetToken';
import { AuditEvent } from '../../../core/domain/AuditEvent';
import { DomainError } from '../../../core/errors/DomainError';

export class ForgotPasswordService {
  private readonly TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly mailer: IMailer,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock,
    private readonly auditRepository: IAuditRepository
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
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(this.clock.now().getTime() + this.TOKEN_EXPIRATION_MS);

    const resetToken = new PasswordResetToken(
      hashedToken,
      user.id,
      expiresAt
    );

    await this.passwordResetTokenRepository.save(resetToken);

    await this.mailer.sendPasswordReset(user.email, rawToken);

    const auditEvent = new AuditEvent(
      crypto.randomUUID(),
      'PasswordResetRequested',
      user.id,
      {},
      request.ipAddress,
      request.userAgent,
      this.clock.now()
    );
    await this.auditRepository.save(auditEvent);
  }
}
