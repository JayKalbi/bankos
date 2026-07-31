import { InvalidStateError } from '../errors/InvalidStateError';

export class PasswordResetToken {
  private _isUsed = false;

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
