import { KeyManager } from '../../../../src/infrastructure/crypto/keys/KeyManager';
import { KeyLoader } from '../../../../src/infrastructure/crypto/keys/KeyLoader';
import crypto from 'crypto';

describe('KeyManager', () => {
  const k1 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const k2 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  const keysConfig = JSON.stringify({
    k1: {
      privateKey: k1.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
      publicKey: k1.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    },
    k2: {
      publicKey: k2.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    },
  });

  const keyLoader = new KeyLoader(JSON.parse(keysConfig));

  it('should load keys and return active key', () => {
    const manager = new KeyManager(keyLoader, 'k1');
    expect(manager.getActiveKeyId()).toBe('k1');
    expect(manager.getActiveKey()).toBeDefined();
    expect(manager.getActiveKey().privateKey).toBeDefined();
  });

  it('should return specific key by kid', () => {
    const manager = new KeyManager(keyLoader, 'k1');
    const key = manager.getKey('k2');
    expect(key).toBeDefined();
    expect(key?.publicKey).toBeDefined();
    expect(key?.privateKey).toBeUndefined(); // k2 has no private key
  });

  it('should return undefined for unknown kid', () => {
    const manager = new KeyManager(keyLoader, 'k1');
    expect(manager.getKey('unknown')).toBeUndefined();
  });

  it('should throw if active key does not exist', () => {
    expect(() => {
      new KeyManager(keyLoader, 'unknown');
    }).toThrow("Active key with kid 'unknown' not found in key configuration");
  });

  it('should throw if active key has no private key', () => {
    expect(() => {
      new KeyManager(keyLoader, 'k2');
    }).toThrow("Active key with kid 'k2' must contain a privateKey for signing");
  });
});
