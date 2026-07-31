import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export interface IEmailVerificationTokenRepository {
  save(token: EmailVerificationToken): Promise<void>;
}
