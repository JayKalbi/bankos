import { IRoleRepository } from '../interfaces/IRoleRepository';
import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { PermissionAssigned } from '../../../core/events/PermissionAssigned';

export class AssignPermissionService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(roleId: string, permissionId: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role " + roleId + " not found");
    }

    await this.roleRepository.assignPermission(roleId, permissionId);
    await this.eventDispatcher.dispatch([new PermissionAssigned(roleId, permissionId)]);
  }
}
