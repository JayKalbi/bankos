import { User } from '../../../src/core/domain/User';
import { InvalidStateError } from '../../../src/core/errors/InvalidStateError';
import { UserLocked } from '../../../src/core/events/UserLocked';
import { UserLoggedIn } from '../../../src/core/events/UserLoggedIn';
import { PasswordChanged } from '../../../src/core/events/PasswordChanged';

describe('User Domain Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User('1', 'test@example.com', 'hashed_pass');
  });

  describe('Login', () => {
    it('should record login successfully', () => {
      user.recordLogin('127.0.0.1', 'Mozilla');

      expect(user.failedLoginAttempts).toBe(0);
      const events = user.domainEvents;
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(UserLoggedIn);
    });

    it('should throw error if trying to log in while locked', () => {
      user.lock('Manual lock');
      user.clearEvents();

      expect(() => {
        user.recordLogin('127.0.0.1', 'Mozilla');
      }).toThrow(InvalidStateError);

      expect(user.domainEvents.length).toBe(0);
    });
  });

  describe('Failed Login Attempts', () => {
    it('should increment failed login attempts', () => {
      user.incrementFailedAttempts();
      expect(user.failedLoginAttempts).toBe(1);
      expect(user.isLocked).toBe(false);
    });

    it('should lock account after max attempts', () => {
      for (let i = 0; i < 5; i++) {
        user.incrementFailedAttempts(5);
      }
      expect(user.isLocked).toBe(true);
      expect(user.failedLoginAttempts).toBe(5);

      const events = user.domainEvents;
      expect(events[0]).toBeInstanceOf(UserLocked);
    });
  });

  describe('Account Locking', () => {
    it('should lock account manually', () => {
      user.lock('Security breach');
      expect(user.isLocked).toBe(true);
      const events = user.domainEvents;
      expect(events[0]).toBeInstanceOf(UserLocked);
      expect((events[0] as UserLocked).reason).toBe('Security breach');
    });

    it('should unlock account and reset failed attempts', () => {
      user.incrementFailedAttempts();
      user.lock('Testing');

      user.unlock();

      expect(user.isLocked).toBe(false);
      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  describe('Password Change', () => {
    it('should change password successfully', () => {
      user.changePassword('new_hashed_pass');
      expect(user.passwordHash).toBe('new_hashed_pass');
      const events = user.domainEvents;
      expect(events[0]).toBeInstanceOf(PasswordChanged);
    });

    it('should throw if new password matches old password', () => {
      expect(() => {
        user.changePassword('hashed_pass');
      }).toThrow(InvalidStateError);
    });
  });

  describe('Email Verification', () => {
    it('should verify email', () => {
      expect(user.emailVerified).toBe(false);
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
    });

    it('should be idempotent when verifying email', () => {
      user.verifyEmail();
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
    });
  });
});
