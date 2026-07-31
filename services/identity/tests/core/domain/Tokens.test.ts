import { EmailVerificationToken } from '../../../src/core/domain/EmailVerificationToken';
import { PasswordResetToken } from '../../../src/core/domain/PasswordResetToken';
import { InvalidStateError } from '../../../src/core/errors/InvalidStateError';
import { EmailVerified } from '../../../src/core/events/EmailVerified';

describe('Domain Tokens', () => {
  describe('EmailVerificationToken', () => {
    it('should mark as used successfully', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const token = new EmailVerificationToken('token_str', 'u1', futureDate);

      expect(token.isUsed).toBe(false);
      token.markAsUsed();
      expect(token.isUsed).toBe(true);

      const events = token.domainEvents;
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(EmailVerified);
    });

    it('should throw if already used', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const token = new EmailVerificationToken('token_str', 'u1', futureDate, true);

      expect(() => {
        token.markAsUsed();
      }).toThrow(InvalidStateError);
    });

    it('should throw if expired', () => {
      const pastDate = new Date(Date.now() - 3600000);
      const token = new EmailVerificationToken('token_str', 'u1', pastDate);

      expect(() => {
        token.markAsUsed();
      }).toThrow(InvalidStateError);
    });
  });

  describe('PasswordResetToken', () => {
    it('should mark as used successfully', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const token = new PasswordResetToken('token_str', 'u1', futureDate);

      expect(token.isUsed).toBe(false);
      token.markAsUsed();
      expect(token.isUsed).toBe(true);
    });

    it('should throw if already used', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const token = new PasswordResetToken('token_str', 'u1', futureDate, true);

      expect(() => {
        token.markAsUsed();
      }).toThrow(InvalidStateError);
    });

    it('should throw if expired', () => {
      const pastDate = new Date(Date.now() - 3600000);
      const token = new PasswordResetToken('token_str', 'u1', pastDate);

      expect(() => {
        token.markAsUsed();
      }).toThrow(InvalidStateError);
    });
  });
});
