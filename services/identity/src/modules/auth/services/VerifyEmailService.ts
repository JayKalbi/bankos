import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { VerifyEmailRequest } from '../dtos/VerifyEmailRequest';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { IClock } from '../interfaces/IClock';
import { DomainError } from '../../../core/errors/DomainError';

export class VerifyEmailService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async execute(request: VerifyEmailRequest): Promise<void> {
    const hashedToken = this.randomGenerator.hashString(request.token);

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
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(verificationToken.domainEvents);
    verificationToken.clearEvents();
  }
}
