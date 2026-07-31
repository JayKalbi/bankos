import { PrismaClient } from '@prisma/client';
import { IRoleRepository } from '../interfaces/IRoleRepository';
import { Role } from '../../../core/domain/Role';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findByName(name: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!record) return null;

    const permissions = record.permissions.map(rp => rp.permission.name);
    return DatabaseMapper.toDomainRole(record, permissions);
  }

  public async findManyByNames(names: string[]): Promise<Role[]> {
    const records = await this.prisma.role.findMany({
      where: {
        name: {
          in: names
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return records.map(record => {
      const permissions = record.permissions.map(rp => rp.permission.name);
      return DatabaseMapper.toDomainRole(record, permissions);
    });
  }
}
