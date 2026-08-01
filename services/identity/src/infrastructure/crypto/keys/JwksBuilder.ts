import * as crypto from 'crypto';
import { KeyManager } from './KeyManager';

export interface JwkKey {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

export interface JwksResponse {
  keys: JwkKey[];
}

export class JwksBuilder {
  constructor(private readonly keyManager: KeyManager) {}

  public buildJwks(): JwksResponse {
    const keys: JwkKey[] = [];
    const publicKeys = this.keyManager.getAllPublicKeys();

    for (const [kid, pem] of Object.entries(publicKeys)) {
      const publicKey = crypto.createPublicKey(pem);
      const jwk = publicKey.export({ format: 'jwk' });

      keys.push({
        kid,
        kty: jwk.kty as string,
        alg: 'RS256',
        use: 'sig',
        n: jwk.n as string,
        e: jwk.e as string,
      });
    }

    return { keys };
  }
}
