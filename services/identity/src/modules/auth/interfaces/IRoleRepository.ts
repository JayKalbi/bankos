import { Role } from '../../../core/domain/Role';

export interface IRoleRepository {
  findByName(name: string): Promise<Role | null>;
  findManyByNames(names: string[]): Promise<Role[]>;
}
