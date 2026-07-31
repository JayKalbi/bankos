import * as crypto from 'crypto';
import { VerifyEmailRequest } from '../dtos/VerifyEmailRequest';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { IClock } from '../interfaces/IClock';
import { DomainError } from '../../../core/errors/DomainError';
import { AuditEvent } from '../../../core/domain/AuditEvent';
import { EmailVerified } from '../../../core/events/EmailVerified';

export class VerifyEmailService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly clock: IClock
  ) {}

  public async execute(request: VerifyEmailRequest): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(request.token).digest('hex');
    
    // Constant time lookup
    const verificationToken = await this.emailVerificationTokenRepository.findByToken(hashedToken);

    if (!verificationToken) {
      throw new DomainError('Invalid or expired verification token');
    }

    if (verificationToken.isExpired()) {
      throw new DomainError('Invalid or expired verification token');
    }

    if (verificationToken.isUsed) {
      throw new DomainError('Invalid or expired verification token');
    }

    const user = await this.userRepository.findById(verificationToken.userId);
    if (!user) {
      throw new DomainError('Invalid or expired verification token');
    }

    user.verifyEmail();
    await this.userRepository.save(user);

    verificationToken.markAsUsed();
    await this.emailVerificationTokenRepository.delete(hashedToken);

    for (const event of verificationToken.domainEvents) {
      if (event instanceof EmailVerified) {
        const auditEvent = new AuditEvent(
          crypto.randomUUID(),
          'EmailVerified',
          user.id,
          {},
          request.ipAddress,
          request.userAgent,
          this.clock.now()
        );
        await this.auditRepository.save(auditEvent);
      }
    }
    verificationToken.clearEvents();
  }
}
