import { IDomainEvent } from '../domain/IDomainEvent';

export class EmailVerified implements IDomainEvent {
  public readonly eventName = 'EmailVerified';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}
