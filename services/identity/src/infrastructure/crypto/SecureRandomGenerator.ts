import * as crypto from 'crypto';
import { IRandomGenerator } from '../../modules/auth/interfaces/IRandomGenerator';

export class SecureRandomGenerator implements IRandomGenerator {
  public generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  public generateUUID(): string {
    return crypto.randomUUID();
  }

  public hashString(data: string, algorithm = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }
}
