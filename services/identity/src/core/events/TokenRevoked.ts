import { IDomainEvent } from '../domain/IDomainEvent';

export class TokenRevoked implements IDomainEvent {
  public readonly eventName = 'TokenRevoked';
  public metadata?: Record<string, unknown>;
  public readonly occurredOn: Date;

  constructor(
    public readonly tokenId: string,
    public readonly userId: string,
    public readonly reason: string
  ) {
    this.occurredOn = new Date();
  }
}

