import { PrismaClient } from '@prisma/client';
import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { Permission } from '../../../core/domain/Permission';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(permission: Permission): Promise<void> {
    await this.prisma.permission.create({
      data: {
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description
      }
    });
  }

  public async update(permission: Permission): Promise<void> {
    await this.prisma.permission.update({
      where: { id: permission.id },
      data: {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description
      }
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({ where: { id } });
  }

  public async findAll(): Promise<Permission[]> {
    const records = await this.prisma.permission.findMany();
    return records.map(DatabaseMapper.toDomainPermission);
  }

  public async findByName(name: string): Promise<Permission | null> {
    const record = await this.prisma.permission.findUnique({ where: { name } });
    if (!record) return null;
    return DatabaseMapper.toDomainPermission(record);
  }
}
