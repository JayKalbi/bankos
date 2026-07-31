export class UserLoggedIn {
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly ipAddress: string,
    public readonly userAgent: string
  ) {
    this.occurredOn = new Date();
  }
}
