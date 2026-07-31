import * as argon2 from 'argon2';
import { IPasswordHasher } from '../../modules/auth/interfaces/IPasswordHasher';
import { config } from '../../config';

export class Argon2PasswordHasher implements IPasswordHasher {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: config.argon2.memoryCost,
      timeCost: config.argon2.timeCost,
      parallelism: config.argon2.parallelism,
    });
  }

  public async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false; // Safely handle malformed hashes
    }
  }
}
