export class AuditEvent {
  constructor(
    public readonly id: string,
    public readonly eventType: string,
    public readonly userId: string | null,
    public readonly payload: Record<string, unknown>,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
