export class UserRegistered {
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    this.occurredOn = new Date();
  }
}
