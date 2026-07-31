export class TokenRevoked {
  public readonly occurredOn: Date;

  constructor(
    public readonly tokenId: string,
    public readonly userId: string,
    public readonly reason: string
  ) {
    this.occurredOn = new Date();
  }
}
