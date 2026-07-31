import { PasswordResetToken } from '../../../core/domain/PasswordResetToken';

export interface IPasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findByToken(hashedToken: string): Promise<PasswordResetToken | null>;
  delete(hashedToken: string): Promise<void>;
}
