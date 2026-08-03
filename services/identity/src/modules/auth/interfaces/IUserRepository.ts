import { User } from '../../../core/domain/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  exists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;

  assignRole(userId: string, roleName: string): Promise<void>;
  removeRole(userId: string, roleName: string): Promise<void>;
  findRoles(userId: string): Promise<string[]>;
  findPermissions(userId: string): Promise<string[]>;
}
