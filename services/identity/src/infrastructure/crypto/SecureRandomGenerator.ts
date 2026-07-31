import * as crypto from 'crypto';
import { IRandomGenerator } from '../../modules/auth/interfaces/IRandomGenerator';

export class SecureRandomGenerator implements IRandomGenerator {
  public generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
