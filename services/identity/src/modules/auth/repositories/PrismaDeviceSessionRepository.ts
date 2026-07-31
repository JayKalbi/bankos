import { PrismaClient } from '@prisma/client';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { DeviceSession } from '../../../core/domain/DeviceSession';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaDeviceSessionRepository implements IDeviceSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<DeviceSession | null> {
    const record = await this.prisma.deviceSession.findUnique({ where: { id } });
    if (!record) return null;
    return DatabaseMapper.toDomainDeviceSession(record);
  }

  public async findByRefreshToken(hashedToken: string): Promise<DeviceSession | null> {
    const record = await this.prisma.deviceSession.findUnique({
      where: { refreshToken: hashedToken }
    });
    if (!record) return null;
    return DatabaseMapper.toDomainDeviceSession(record);
  }

  public async findActiveSessions(userId: string): Promise<DeviceSession[]> {
    const records = await this.prisma.deviceSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    return records.map(DatabaseMapper.toDomainDeviceSession);
  }

  public async save(session: DeviceSession): Promise<void> {
    const prismaSession = DatabaseMapper.toPrismaDeviceSession(session);

    await this.prisma.deviceSession.upsert({
      where: { id: session.id },
      create: {
        id: prismaSession.id,
        userId: prismaSession.userId,
        refreshToken: prismaSession.refreshToken,
        ipAddress: prismaSession.ipAddress,
        userAgent: prismaSession.userAgent,
        isRevoked: prismaSession.isRevoked,
        expiresAt: prismaSession.expiresAt,
        createdAt: prismaSession.createdAt
      },
      update: {
        isRevoked: prismaSession.isRevoked
      }
    });
  }

  public async revokeSession(id: string): Promise<void> {
    await this.prisma.deviceSession.update({
      where: { id },
      data: { isRevoked: true }
    });
  }

  public async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.deviceSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });
  }
}
