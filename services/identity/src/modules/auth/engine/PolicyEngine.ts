import { RBACEvaluator } from './RBACEvaluator';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PolicyEngine {
  public static requireRole(grantedRoles: string[], requiredRole: string): boolean {
    return grantedRoles.includes(requiredRole);
  }

  public static requirePermission(grantedPermissions: string[], requiredPermission: string): boolean {
    return RBACEvaluator.hasPermission(grantedPermissions, requiredPermission);
  }

  public static requireAny(grantedPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(req => RBACEvaluator.hasPermission(grantedPermissions, req));
  }

  public static requireAll(grantedPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(req => RBACEvaluator.hasPermission(grantedPermissions, req));
  }

  public static not(grantedPermissions: string[], forbiddenPermission: string): boolean {
    return !RBACEvaluator.hasPermission(grantedPermissions, forbiddenPermission);
  }
}
