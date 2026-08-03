import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../../core/domain/User';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id }
    });
    if (!record) return null;
    return DatabaseMapper.toDomainUser(record);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email }
    });
    if (!record) return null;
    return DatabaseMapper.toDomainUser(record);
  }

  public async exists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  public async save(user: User): Promise<void> {
    const prismaUser = DatabaseMapper.toPrismaUser(user);
    await this.prisma.user.create({
      data: {
        id: prismaUser.id,
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        isLocked: prismaUser.isLocked,
        failedLoginAttempts: prismaUser.failedLoginAttempts,
        emailVerified: prismaUser.emailVerified
      }
    });
  }

  public async update(user: User): Promise<void> {
    const prismaUser = DatabaseMapper.toPrismaUser(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: prismaUser.passwordHash,
        isLocked: prismaUser.isLocked,
        failedLoginAttempts: prismaUser.failedLoginAttempts,
        emailVerified: prismaUser.emailVerified
      }
    });
  }

  public async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error("Role " + roleName + " not found");

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id }
      },
      update: {},
      create: { userId, roleId: role.id }
    });
  }

  public async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    try {
      await this.prisma.userRole.delete({
        where: {
          userId_roleId: { userId, roleId: role.id }
        }
      });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      // Ignored if doesn't exist
    }
  }

  public async findRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    return userRoles.map(ur => ur.role.name);
  }

  public async findPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });
    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }
    return Array.from(permissions);
  }
}
