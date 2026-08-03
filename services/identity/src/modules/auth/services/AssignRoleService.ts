import { IUserRepository } from '../interfaces/IUserRepository';
import { IRoleRepository } from '../interfaces/IRoleRepository';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { RoleAssignedToUser } from '../../../core/events/RoleAssignedToUser';

export class AssignRoleService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(userId: string, roleName: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User " + userId + " not found");
    }

    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new Error("Role " + roleName + " not found");
    }

    await this.userRepository.assignRole(userId, roleName);

    await this.eventDispatcher.dispatch([new RoleAssignedToUser(userId, roleName)]);
  }
}
