// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RBACEvaluator {
  /**
   * Checks if a specific required permission is satisfied by any of the granted permissions.
   * Handles wildcards (e.g., account.* satisfies account.read).
   */
  public static hasPermission(grantedPermissions: string[], requiredPermission: string): boolean {
    return grantedPermissions.some(granted => this.matchPermission(granted, requiredPermission));
  }

  private static matchPermission(granted: string, required: string): boolean {
    if (granted === required) return true;
    if (granted === '*') return true;

    // Handle wildcard matching like 'account.*'
    if (granted.endsWith('.*')) {
      const prefix = granted.slice(0, -2); // remove '.*'
      if (required.startsWith(prefix + '.')) {
        return true;
      }
      // account.* should also match exactly 'account' if it was structured that way,
      // but standard is resource.action
    }
    return false;
  }
}
