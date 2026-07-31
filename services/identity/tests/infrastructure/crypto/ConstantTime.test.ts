import { ConstantTime } from '../../../src/infrastructure/crypto/ConstantTime';

describe('ConstantTime', () => {
  it('should return true for identical strings', () => {
    const str = 'super-secret-string-123';
    expect(ConstantTime.isEqual(str, str)).toBe(true);
  });

  it('should return false for different strings of same length', () => {
    const str1 = 'super-secret-string-123';
    const str2 = 'super-secret-string-124';
    expect(ConstantTime.isEqual(str1, str2)).toBe(false);
  });

  it('should return false for strings of different lengths', () => {
    const str1 = 'super-secret-string';
    const str2 = 'super-secret-string-123';
    expect(ConstantTime.isEqual(str1, str2)).toBe(false);
  });

  it('should return false if arguments are not strings', () => {
    expect(ConstantTime.isEqual('123', null as any)).toBe(false);
    expect(ConstantTime.isEqual(undefined as any, '123')).toBe(false);
  });
});
