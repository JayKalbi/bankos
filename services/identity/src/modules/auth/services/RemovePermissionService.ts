import { IRoleRepository } from '../interfaces/IRoleRepository';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { PermissionRemoved } from '../../../core/events/PermissionRemoved';

export class RemovePermissionService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(roleId: string, permissionId: string): Promise<void> {
    await this.roleRepository.removePermission(roleId, permissionId);
    await this.eventDispatcher.dispatch([new PermissionRemoved(roleId, permissionId)]);
  }
}
