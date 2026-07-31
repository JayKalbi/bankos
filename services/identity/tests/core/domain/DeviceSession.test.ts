import { DeviceSession } from '../../../src/core/domain/DeviceSession';
import { InvalidStateError } from '../../../src/core/errors/InvalidStateError';
import { TokenRevoked } from '../../../src/core/events/TokenRevoked';

describe('DeviceSession Domain Entity', () => {
  it('should create an active session', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
    const session = new DeviceSession('1', 'u1', 'token123', '127.0.0.1', 'Mozilla', futureDate);

    expect(session.isRevoked).toBe(false);
    expect(session.isExpired()).toBe(false);
  });

  it('should evaluate as expired if past expiration date', () => {
    const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
    const session = new DeviceSession('1', 'u1', 'token123', '127.0.0.1', 'Mozilla', pastDate);

    expect(session.isExpired()).toBe(true);
  });

  it('should revoke a valid session', () => {
    const futureDate = new Date(Date.now() + 3600000);
    const session = new DeviceSession('1', 'u1', 'token123', '127.0.0.1', 'Mozilla', futureDate);

    session.revoke('User requested logout');

    expect(session.isRevoked).toBe(true);
    const events = session.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(TokenRevoked);
    expect((events[0] as TokenRevoked).reason).toBe('User requested logout');
  });

  it('should throw if revoking an already revoked session', () => {
    const futureDate = new Date(Date.now() + 3600000);
    const session = new DeviceSession('1', 'u1', 'token123', '127.0.0.1', 'Mozilla', futureDate, new Date(), true);

    expect(() => {
      session.revoke('Another reason');
    }).toThrow(InvalidStateError);
  });
});
