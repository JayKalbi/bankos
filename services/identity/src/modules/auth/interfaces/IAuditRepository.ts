import { AuditEvent } from '../../../core/domain/AuditEvent';

export interface IAuditRepository {
  save(event: AuditEvent): Promise<void>;
}
