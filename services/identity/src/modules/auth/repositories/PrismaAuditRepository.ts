import { PrismaClient } from '@prisma/client';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { AuditEvent } from '../../../core/domain/AuditEvent';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(event: AuditEvent): Promise<void> {
    const prismaEvent = DatabaseMapper.toPrismaAuditEvent(event);

    await this.prisma.auditEvent.create({
      data: {
        id: prismaEvent.id,
        eventType: prismaEvent.eventType,
        userId: prismaEvent.userId,
        payload: prismaEvent.payload ?? {},
        ipAddress: prismaEvent.ipAddress,
        userAgent: prismaEvent.userAgent,
        timestamp: prismaEvent.timestamp
      }
    });
  }
}
