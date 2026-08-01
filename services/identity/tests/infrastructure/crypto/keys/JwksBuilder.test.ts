import { JwksBuilder } from '../../../../src/infrastructure/crypto/keys/JwksBuilder';
import { KeyManager } from '../../../../src/infrastructure/crypto/keys/KeyManager';
import { KeyLoader } from '../../../../src/infrastructure/crypto/keys/KeyLoader';
import crypto from 'crypto';

describe('JwksBuilder', () => {
  const k1 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  const keysConfig = JSON.stringify({
    k1: {
      privateKey: k1.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      publicKey: k1.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    },
  });

  const keyLoader = new KeyLoader(JSON.parse(keysConfig));
  const keyManager = new KeyManager(keyLoader, 'k1');
  const jwksBuilder = new JwksBuilder(keyManager);

  it('should generate valid JWKS', () => {
    const jwks = jwksBuilder.buildJwks();
    expect(jwks).toBeDefined();
    expect(jwks.keys).toBeInstanceOf(Array);
    expect(jwks.keys.length).toBe(1);

    const key = jwks.keys[0];
    expect(key.kid).toBe('k1');
    expect(key.kty).toBe('RSA');
    expect(key.alg).toBe('RS256');
    expect(key.use).toBe('sig');
    expect(key.n).toBeDefined();
    expect(key.e).toBe('AQAB');
  });
});
