import {
  User as PrismaUser,
  Role as PrismaRole,
  DeviceSession as PrismaDeviceSession,
  AuditEvent as PrismaAuditEvent,
  UserRole,
  Prisma
} from '@prisma/client';
import { User } from '../../core/domain/User';
import { Role } from '../../core/domain/Role';
import { DeviceSession } from '../../core/domain/DeviceSession';
import { AuditEvent } from '../../core/domain/AuditEvent';

type PrismaUserWithRoles = PrismaUser & {
  roles?: (UserRole & { role: PrismaRole })[];
};

export const DatabaseMapper = {
  toDomainUser(prismaUser: PrismaUserWithRoles): User {
    const roles = prismaUser.roles ? prismaUser.roles.map(ur => ur.role.name) : [];

    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      roles,
      prismaUser.isLocked,
      prismaUser.failedLoginAttempts,
      prismaUser.emailVerified,
      false // isNew is false since it's loaded from DB
    );
  },

  toPrismaUser(user: User): PrismaUser {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      isLocked: user.isLocked,
      failedLoginAttempts: user.failedLoginAttempts,
      emailVerified: user.emailVerified,
      createdAt: new Date(), // Managed by DB primarily, dummy value for inserts
      updatedAt: new Date()
    };
  },

  toDomainRole(prismaRole: PrismaRole, permissions: string[] = []): Role {
    return new Role(
      prismaRole.id,
      prismaRole.name,
      permissions
    );
  },

  toDomainDeviceSession(prismaSession: PrismaDeviceSession): DeviceSession {
    return new DeviceSession(
      prismaSession.id,
      prismaSession.userId,
      prismaSession.refreshToken,
      prismaSession.ipAddress,
      prismaSession.userAgent,
      prismaSession.expiresAt,
      prismaSession.createdAt,
      prismaSession.isRevoked
    );
  },

  toPrismaDeviceSession(session: DeviceSession): PrismaDeviceSession {
    return {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isRevoked: session.isRevoked,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: new Date()
    };
  },

  toPrismaAuditEvent(event: AuditEvent): PrismaAuditEvent {
    return {
      id: event.id,
      eventType: event.eventType,
      userId: event.userId,
      payload: event.payload as unknown as Prisma.JsonValue,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp
    };
  }
};
