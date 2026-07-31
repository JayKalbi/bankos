import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../../core/domain/User';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!record) return null;
    return DatabaseMapper.toDomainUser(record);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
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
}
