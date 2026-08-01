import { IDomainEvent } from '../../../core/domain/IDomainEvent';

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}
