import { IDomainEvent } from '../domain/IDomainEvent';

export class RoleRemovedFromUser implements IDomainEvent {
  public readonly occurredOn: Date = new Date();
  public readonly eventName = '';
  public metadata?: Record<string, unknown>;

  constructor(
    public readonly userId: string,
    public readonly roleId: string
  ) {}
}
