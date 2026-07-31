import { InvalidStateError } from '../errors/InvalidStateError';
import { TokenRevoked } from '../events/TokenRevoked';

export class DeviceSession {
  private _isRevoked: boolean;
  private readonly _domainEvents: unknown[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string,
    private _refreshToken: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    private _expiresAt: Date,
    public readonly createdAt: Date = new Date(),
    isRevoked = false
  ) {
    this._isRevoked = isRevoked;
  }

  public get refreshToken(): string {
    return this._refreshToken;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public rotateToken(newHashedToken: string, newExpiresAt: Date, absoluteMaxExpiration?: Date): void {
    if (this._isRevoked) {
      throw new InvalidStateError('Cannot rotate token on a revoked session');
    }
    this._refreshToken = newHashedToken;
    
    // Sliding expiration with absolute maximum
    if (absoluteMaxExpiration && newExpiresAt > absoluteMaxExpiration) {
      this._expiresAt = absoluteMaxExpiration;
    } else {
      this._expiresAt = newExpiresAt;
    }
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
