import { IDomainEvent } from '../domain/IDomainEvent';

export class UserRegistered implements IDomainEvent {
  public readonly eventName = 'UserRegistered';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    this.occurredOn = new Date();
  }
}
