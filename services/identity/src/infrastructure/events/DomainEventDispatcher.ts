import { IDomainEventDispatcher } from '../../modules/auth/interfaces/IDomainEventDispatcher';
import { IDomainEventHandler } from '../../modules/auth/interfaces/IDomainEventHandler';
import { IDomainEvent } from '../../core/domain/IDomainEvent';

export class DomainEventDispatcher implements IDomainEventDispatcher {
  private readonly handlers: IDomainEventHandler[] = [];

  public register(handler: IDomainEventHandler): void {
    this.handlers.push(handler);
  }

  public async dispatch(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const handler of this.handlers) {
        await handler.handle(event);
      }
    }
  }
}
