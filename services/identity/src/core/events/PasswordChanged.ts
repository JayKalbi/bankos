export class PasswordChanged {
  public readonly occurredOn: Date;

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}
