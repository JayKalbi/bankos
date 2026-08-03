import { IDomainEvent } from '../domain/IDomainEvent';

export class PermissionCreated implements IDomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventName = '';
  public metadata?: Record<string, unknown>;

  constructor(
    public readonly permissionId: string,
    public readonly resource: string,
    public readonly action: string
  ) {}
}
