import { PasswordResetRequested } from '../events/PasswordResetRequested';
import { IDomainEvent } from './IDomainEvent';
import { InvalidStateError } from '../errors/InvalidStateError';

export class PasswordResetToken {
  private _isUsed = false;
  private readonly _domainEvents: IDomainEvent[] = [];

  constructor(
    public readonly token: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    isUsed = false
  ) {
    this._isUsed = isUsed;

    if (!isUsed) {
      this._domainEvents.push(new PasswordResetRequested(this.userId));
    }
  }

  public get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  public clearEvents(): void {
    this._domainEvents.length = 0;
  }

  public get isUsed(): boolean {
    return this._isUsed;
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
  }
}


