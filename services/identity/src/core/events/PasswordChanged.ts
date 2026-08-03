import { IDomainEvent } from '../domain/IDomainEvent';

export class PasswordChanged implements IDomainEvent {
  public readonly eventName = 'PasswordChanged';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}
