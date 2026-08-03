import { IDomainEvent } from '../domain/IDomainEvent';

export class PermissionRemoved implements IDomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventName = '';
  public metadata?: Record<string, unknown>;

  constructor(
    public readonly roleId: string,
    public readonly permissionId: string
  ) {}
}
