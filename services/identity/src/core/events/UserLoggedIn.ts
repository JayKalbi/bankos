import { IDomainEvent } from '../domain/IDomainEvent';

export class UserLoggedIn implements IDomainEvent {
  public readonly eventName = 'UserLoggedIn';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly ipAddress: string,
    public readonly userAgent: string
  ) {
    this.occurredOn = new Date();
  }
}

