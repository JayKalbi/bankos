import { Permission } from '../../../core/domain/Permission';

export interface IPermissionRepository {
  create(permission: Permission): Promise<void>;
  update(permission: Permission): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Permission[]>;
  findByName(name: string): Promise<Permission | null>;
}
