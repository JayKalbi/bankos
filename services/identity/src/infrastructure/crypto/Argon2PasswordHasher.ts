import * as argon2 from 'argon2';
import { IPasswordHasher } from '../../modules/auth/interfaces/IPasswordHasher';
import { config } from '../../config';

export class Argon2PasswordHasher implements IPasswordHasher {
  private applyPepper(password: string): string {
    if (!config.argon2.pepper) {
      return password;
    }
    // We append the pepper to the plaintext. Another approach is HMAC, but simple concatenation is sufficient with Argon2id.
    return `${password}${config.argon2.pepper}`;
  }

  public async hash(password: string): Promise<string> {
    const pepperedPassword = this.applyPepper(password);
    return argon2.hash(pepperedPassword, {
      type: argon2.argon2id,
      memoryCost: config.argon2.memoryCost,
      timeCost: config.argon2.timeCost,
      parallelism: config.argon2.parallelism,
    });
  }

  public async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      const pepperedPassword = this.applyPepper(plaintext);
      return await argon2.verify(hash, pepperedPassword);
    } catch {
      return false; // Safely handle malformed hashes
    }
  }
}
