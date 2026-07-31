import { SecureRandomGenerator } from '../../../src/infrastructure/crypto/SecureRandomGenerator';

describe('SecureRandomGenerator', () => {
  const generator = new SecureRandomGenerator();

  it('should generate a string of correct length', () => {
    const token = generator.generateToken(32);
    expect(token).toBeDefined();
    expect(token.length).toBe(64); // Hex string length is twice the byte length
  });

  it('should generate unique tokens', () => {
    const token1 = generator.generateToken();
    const token2 = generator.generateToken();
    expect(token1).not.toBe(token2);
  });

  it('should generate with default length 32', () => {
    const token = generator.generateToken();
    expect(token.length).toBe(64);
  });
});
