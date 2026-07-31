export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly permissions: string[] = []
  ) {}

  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
