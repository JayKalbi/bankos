import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export interface IEmailVerificationTokenRepository {
  save(token: EmailVerificationToken): Promise<void>;
  findByToken(hashedToken: string): Promise<EmailVerificationToken | null>;
  delete(hashedToken: string): Promise<void>;
}
