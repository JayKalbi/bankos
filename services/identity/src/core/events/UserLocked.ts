export class UserLocked {
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly reason: string
  ) {
    this.occurredOn = new Date();
  }
}
