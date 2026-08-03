import { PrismaClient } from '@prisma/client';
import { IRoleRepository } from '../interfaces/IRoleRepository';
import { Role } from '../../../core/domain/Role';
import { DatabaseMapper } from '../../../infrastructure/database/mapper';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(role: Role): Promise<void> {
    await this.prisma.role.create({
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        systemRole: role.systemRole,
        parentId: role.parentId
      }
    });
  }

  public async update(role: Role): Promise<void> {
    await this.prisma.role.update({
      where: { id: role.id },
      data: {
        name: role.name,
        description: role.description,
        systemRole: role.systemRole,
        parentId: role.parentId
      }
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  public async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId }
      },
      update: {},
      create: { roleId, permissionId }
    });
  }

  public async removePermission(roleId: string, permissionId: string): Promise<void> {
    try {
      await this.prisma.rolePermission.delete({
        where: {
          roleId_permissionId: { roleId, permissionId }
        }
      });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      // Ignore if not found
    }
  }

  public async findPermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
    return rolePermissions.map(rp => rp.permission.name);
  }

  public async findByName(name: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({ where: { name } });
    if (!record) return null;
    return DatabaseMapper.toDomainRole(record);
  }

  public async findById(id: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({ where: { id } });
    if (!record) return null;
    return DatabaseMapper.toDomainRole(record);
  }

  public async findAll(): Promise<Role[]> {
    const records = await this.prisma.role.findMany();
    return records.map(DatabaseMapper.toDomainRole);
  }
}
