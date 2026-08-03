import { PermissionResolver } from './PermissionResolver';
import { IRoleRepository } from '../interfaces/IRoleRepository';

export class AuthorizationEngine {
  private permissionResolver: PermissionResolver;

  constructor(private readonly roleRepository: IRoleRepository) {
    this.permissionResolver = new PermissionResolver(roleRepository);
  }

  /**
   * Resolves all effective roles recursively
   */
  public async resolveRoles(roleNames: string[]): Promise<string[]> {
    const roles = await this.roleRepository.findAll();
    return this.permissionResolver.resolveEffectiveRoles(roleNames, roles);
  }

  /**
   * Resolves all effective permissions for a set of roles
   */
  public async resolvePermissions(roleNames: string[]): Promise<string[]> {
    return this.permissionResolver.resolveEffectivePermissions(roleNames);
  }
}
