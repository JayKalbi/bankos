export class Permission {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly description: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
