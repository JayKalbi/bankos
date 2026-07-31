import { Argon2PasswordHasher } from '../../../src/infrastructure/crypto/Argon2PasswordHasher';

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('should hash a password and verify it correctly', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hasher.hash(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await hasher.verify(hash, password);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hasher.hash(password);

    const isValid = await hasher.verify(hash, 'WrongPassword123!');
    expect(isValid).toBe(false);
  });

  it('should return false for malformed hash safely', async () => {
    const password = 'SuperSecretPassword123!';
    const isValid = await hasher.verify('invalid-hash-string', password);
    expect(isValid).toBe(false);
  });
});
