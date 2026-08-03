import { IDomainEvent } from '../domain/IDomainEvent';

export class RoleAssignedToUser implements IDomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventName = '';
  public metadata?: Record<string, unknown>;

  constructor(
    public readonly userId: string,
    public readonly roleId: string
  ) {}
}
