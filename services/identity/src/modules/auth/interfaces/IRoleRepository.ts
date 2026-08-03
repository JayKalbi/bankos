import { Role } from '../../../core/domain/Role';

export interface IRoleRepository {
  create(role: Role): Promise<void>;
  update(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  findPermissions(roleId: string): Promise<string[]>;
  findByName(name: string): Promise<Role | null>;
  findById(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}
