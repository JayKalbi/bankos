import { IDomainEvent } from '../domain/IDomainEvent';

export class PasswordResetRequested implements IDomainEvent {
  public readonly eventName = 'PasswordResetRequested';
  public readonly occurredOn = new Date();
  public metadata?: Record<string, unknown>;

  constructor(public readonly userId: string) {}
}
