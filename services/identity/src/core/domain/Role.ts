export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null = null,
    public readonly systemRole = false,
    public readonly parentId: string | null = null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
