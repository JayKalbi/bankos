import { IDomainEvent } from './IDomainEvent';
import { InvalidStateError } from '../errors/InvalidStateError';
import { UserLocked } from '../events/UserLocked';
import { UserLoggedIn } from '../events/UserLoggedIn';
import { PasswordChanged } from '../events/PasswordChanged';
import { UserRegistered } from '../events/UserRegistered';

export class User {
  private _isLocked: boolean;
  private _failedLoginAttempts: number;
  private _emailVerified: boolean;
  private _passwordHash: string;
  private readonly _domainEvents: IDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly email: string,
    passwordHash: string,
    isLocked = false,
    failedLoginAttempts = 0,
    emailVerified = false,
    isNew = false
  ) {
    this._passwordHash = passwordHash;
    this._isLocked = isLocked;
    this._failedLoginAttempts = failedLoginAttempts;
    this._emailVerified = emailVerified;

    if (isNew) {
      this._domainEvents.push(new UserRegistered(id, email));
    }
  }

  public get isLocked(): boolean {
    return this._isLocked;
  }

  public get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  public get emailVerified(): boolean {
    return this._emailVerified;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  public clearEvents(): void {
    this._domainEvents.length = 0;
  }

  public lock(reason: string): void {
    if (this._isLocked) {
      return;
    }
    this._isLocked = true;
    this._domainEvents.push(new UserLocked(this.id, reason));
  }

  public unlock(): void {
    this._isLocked = false;
    this._failedLoginAttempts = 0;
  }

  public incrementFailedAttempts(maxAttempts = 5): void {
    if (this._isLocked) {
      return;
    }
    this._failedLoginAttempts += 1;
    if (this._failedLoginAttempts >= maxAttempts) {
      this.lock('Exceeded maximum failed login attempts');
    }
  }

  public resetFailedAttempts(): void {
    this._failedLoginAttempts = 0;
  }

  public verifyEmail(): void {
    if (this._emailVerified) {
      return; // Idempotent
    }
    this._emailVerified = true;
  }

  public changePassword(newPasswordHash: string): void {
    if (this._passwordHash === newPasswordHash) {
      throw new InvalidStateError('New password must be different from the old password');
    }
    this._passwordHash = newPasswordHash;
    this._domainEvents.push(new PasswordChanged(this.id));
  }

  public recordLogin(ipAddress: string, userAgent: string): void {
    if (this._isLocked) {
      throw new InvalidStateError('User is locked and cannot log in');
    }
    this.resetFailedAttempts();
    this._domainEvents.push(new UserLoggedIn(this.id, ipAddress, userAgent));
  }
}
