import { Role } from '../../../core/domain/Role';
import { IRoleRepository } from '../interfaces/IRoleRepository';

export class PermissionResolver {
  constructor(private readonly roleRepository: IRoleRepository) {}

  public async resolveEffectivePermissions(roleNames: string[]): Promise<string[]> {
    const roles = await this.roleRepository.findAll();

    // Build a map for quick lookup
    const roleMap = new Map(roles.map(r => [r.name, r]));

    const effectiveRoles = new Set<string>();

    // Helper to recursively collect roles
    const collectRoles = (currentRoleName: string) => {
      if (effectiveRoles.has(currentRoleName)) return;

      const role = roleMap.get(currentRoleName);
      if (!role) return;

      effectiveRoles.add(currentRoleName);

      if (role.parentId) {
        const parentRole = roles.find(r => r.id === role.parentId);
        if (parentRole) {
          collectRoles(parentRole.name);
        }
      }
    };

    // Collect all roles based on inheritance
    // NOTE: If role A inherits B, does A get B's permissions or does B get A's?
    // "SuperAdmin -> Admin -> RiskManager -> Analyst -> User"
    // "Admin automatically receives all User permissions."
    // This means Admin inherits from User. So parentId of Admin is User's ID.
    // If a user has 'Admin' role, we traverse parents to accumulate permissions.

    for (const roleName of roleNames) {
      collectRoles(roleName);
    }

    const effectivePermissions = new Set<string>();

    for (const roleName of effectiveRoles) {
      const role = roleMap.get(roleName);
      if (role) {
        const perms = await this.roleRepository.findPermissions(role.id);
        for (const p of perms) {
          effectivePermissions.add(p);
        }
      }
    }

    return Array.from(effectivePermissions);
  }

  public resolveEffectiveRoles(roleNames: string[], roles: Role[]): string[] {
      const roleMap = new Map(roles.map(r => [r.name, r]));
      const effectiveRoles = new Set<string>();

      const collectRoles = (currentRoleName: string) => {
        if (effectiveRoles.has(currentRoleName)) return;
        const role = roleMap.get(currentRoleName);
        if (!role) return;
        effectiveRoles.add(currentRoleName);
        if (role.parentId) {
          const parentRole = roles.find(r => r.id === role.parentId);
          if (parentRole) {
            collectRoles(parentRole.name);
          }
        }
      };

      for (const roleName of roleNames) {
        collectRoles(roleName);
      }
      return Array.from(effectiveRoles);
  }
}
