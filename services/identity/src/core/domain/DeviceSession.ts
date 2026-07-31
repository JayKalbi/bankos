import { InvalidStateError } from '../errors/InvalidStateError';
import { TokenRevoked } from '../events/TokenRevoked';

export class DeviceSession {
  private _isRevoked: boolean;
  private readonly _domainEvents: unknown[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly refreshToken: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date = new Date(),
    isRevoked = false
  ) {
    this._isRevoked = isRevoked;
  }

  public get isRevoked(): boolean {
    return this._isRevoked;
  }

  public get domainEvents(): unknown[] {
    return this._domainEvents;
  }

  public clearEvents(): void {
    this._domainEvents.length = 0;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public revoke(reason: string): void {
    if (this._isRevoked) {
      throw new InvalidStateError('Session is already revoked');
    }
    this._isRevoked = true;
    this._domainEvents.push(new TokenRevoked(this.id, this.userId, reason));
  }
}
