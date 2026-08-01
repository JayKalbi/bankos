import { IDomainEvent } from '../domain/IDomainEvent';

export class UserLocked implements IDomainEvent {
  public readonly eventName = 'UserLocked';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly reason: string
  ) {
    this.occurredOn = new Date();
  }
}

