import { IDomainEvent } from '../../../core/domain/IDomainEvent';

export interface IDomainEventDispatcher {
  dispatch(events: IDomainEvent[]): Promise<void>;
}
