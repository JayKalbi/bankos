import { IUserRepository } from '../interfaces/IUserRepository';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { IMailer } from '../interfaces/IMailer';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IClock } from '../interfaces/IClock';
import { EmailValidator } from '../validators/EmailValidator';
import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export class SendVerificationEmailService {
  private readonly TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly mailer: IMailer,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async execute(email: string): Promise<void> {
    const normalizedEmail = EmailValidator.normalize(email);

    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Always return generic success, do not expose whether email exists
    if (!user) {
      return;
    }

    if (user.emailVerified) {
      return; // Already verified, do nothing
    }

    const rawToken = this.randomGenerator.generateToken(32);
    const hashedToken = this.randomGenerator.hashString(rawToken);
    const expiresAt = new Date(this.clock.now().getTime() + this.TOKEN_EXPIRATION_MS);

    const verificationToken = new EmailVerificationToken(
      hashedToken,
      user.id,
      expiresAt
    );

    await this.emailVerificationTokenRepository.save(verificationToken);
    await this.mailer.sendVerificationEmail(user.email, rawToken);
  }
}
