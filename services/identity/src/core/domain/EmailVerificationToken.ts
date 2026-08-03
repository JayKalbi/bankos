import { IDomainEvent } from './IDomainEvent';
import { InvalidStateError } from '../errors/InvalidStateError';
import { EmailVerified } from '../events/EmailVerified';

export class EmailVerificationToken {
  private _isUsed = false;
  private readonly _domainEvents: IDomainEvent[] = [];

  constructor(
    public readonly token: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    isUsed = false
  ) {
    this._isUsed = isUsed;
  }

  public get isUsed(): boolean {
    return this._isUsed;
  }

  public get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  public clearEvents(): void {
    this._domainEvents.length = 0;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public markAsUsed(): void {
    if (this._isUsed) {
      throw new InvalidStateError('Token has already been used');
    }
    if (this.isExpired()) {
      throw new InvalidStateError('Token is expired');
    }
    this._isUsed = true;
    this._domainEvents.push(new EmailVerified(this.userId));
  }
}
