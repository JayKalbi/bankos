import { IDomainEventHandler } from '../../../modules/auth/interfaces/IDomainEventHandler';
import { IDomainEvent } from '../../../core/domain/IDomainEvent';
import { IAuditRepository } from '../../../modules/auth/interfaces/IAuditRepository';
import { IRandomGenerator } from '../../../modules/auth/interfaces/IRandomGenerator';
import { IClock } from '../../../modules/auth/interfaces/IClock';
import { AuditEvent } from '../../../core/domain/AuditEvent';
import { UserRegistered } from '../../../core/events/UserRegistered';
import { UserLoggedIn } from '../../../core/events/UserLoggedIn';

export class AuditEventHandler implements IDomainEventHandler {
  constructor(
    private readonly auditRepository: IAuditRepository,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async handle(event: IDomainEvent): Promise<void> {
    const ipAddress = event.metadata?.ipAddress as string || 'unknown';
    const userAgent = event.metadata?.userAgent as string || 'unknown';

    let details: Record<string, unknown> = {};
    let targetUserId = '';

    if (event.eventName === 'UserRegistered') {
      const e = event as UserRegistered;
      targetUserId = e.userId;
      details = { email: e.email };
    } else if (event.eventName === 'UserLoggedIn') {
      const e = event as UserLoggedIn;
      targetUserId = e.userId;
      details = { ipAddress: e.ipAddress, userAgent: e.userAgent };
    } else if ('userId' in event) {
      targetUserId = (event as IDomainEvent & { userId: string }).userId;
    } else {
      targetUserId = 'system';
    }

    // For events that we don't strictly care to audit in this simplistic mapping, we might still audit them
    // but the original code only audited UserLoggedIn and UserRegistered. We'll audit all for completeness.

    const auditEvent = new AuditEvent(
      this.randomGenerator.generateUUID(),
      event.eventName,
      targetUserId,
      details,
      ipAddress,
      userAgent,
      this.clock.now()
    );

    await this.auditRepository.save(auditEvent);
  }
}
