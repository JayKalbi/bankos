import { IUserRepository } from '../interfaces/IUserRepository';
import { IRoleRepository } from '../interfaces/IRoleRepository';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { RoleRemovedFromUser } from '../../../core/events/RoleRemovedFromUser';

export class RemoveRoleService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(userId: string, roleName: string): Promise<void> {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      return; // Ignore if role doesn't exist
    }

    await this.userRepository.removeRole(userId, roleName);
    await this.eventDispatcher.dispatch([new RoleRemovedFromUser(userId, roleName)]);
  }
}
