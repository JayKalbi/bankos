import { IDomainEvent } from '../domain/IDomainEvent';

export class AuthorizationDenied implements IDomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventName = '';
  public metadata?: Record<string, unknown>;

  constructor(
    public readonly userId: string,
    public readonly requiredPolicy: string,
    public readonly resource?: string
  ) {}
}
