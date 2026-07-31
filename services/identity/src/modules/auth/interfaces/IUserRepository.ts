import { User } from '../../../core/domain/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  exists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
