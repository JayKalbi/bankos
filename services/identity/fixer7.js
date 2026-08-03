const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. Add occurredOn to events
const eventFiles = [
  'AuthorizationDenied.ts', 'PermissionAssigned.ts', 'PermissionCreated.ts',
  'PermissionRemoved.ts', 'RoleAssignedToUser.ts', 'RoleCreated.ts',
  'RoleDeleted.ts', 'RoleRemovedFromUser.ts'
];
for (const f of eventFiles) {
  const p = 'src/core/events/' + f;
  fixFile(p, c => {
    if (!c.includes('public readonly occurredOn: Date')) {
      return c.replace(/public readonly eventName = '([^']+)';/, "public readonly occurredOn: Date = new Date();\n  public readonly eventName = '\';");
    }
    return c;
  });
}

// 2. Fix requireAuth.ts dispatching single events instead of array
fixFile('src/modules/auth/middleware/requireAuth.ts', c =>
  c.replace(/await dispatcher\.dispatch\(new AuthorizationDenied([^\)]+)\)/g, 'await dispatcher.dispatch([new AuthorizationDenied\])')
);
// Make sure requireAuth isn't double arrayed
fixFile('src/modules/auth/middleware/requireAuth.ts', c =>
  c.replace(/\[\[new AuthorizationDenied/g, '[new AuthorizationDenied').replace(/\)\]\]/g, ')]')
);


// 3. Fix dispatching array in AssignPermission, AssignRole, CreatePermission, CreateRole, RemovePermission, RemoveRole
const serviceFiles = [
  'AssignPermissionService.ts', 'AssignRoleService.ts', 'CreatePermissionService.ts',
  'CreateRoleService.ts', 'RemovePermissionService.ts', 'RemoveRoleService.ts'
];
for (const f of serviceFiles) {
  fixFile('src/modules/auth/services/' + f, c =>
    c.replace(/await this\.eventDispatcher\.dispatch\(new (RoleCreated|PermissionCreated|RoleAssignedToUser|PermissionAssigned|RoleRemovedFromUser|PermissionRemoved|RoleDeleted)([^\)]+)\)/g, 'await this.eventDispatcher.dispatch([new \\])')
  );
  fixFile('src/modules/auth/services/' + f, c =>
    c.replace(/\[\[new /g, '[new ').replace(/\)\]\]/g, ')]')
  );
}

// 4. DeviceSession.ts missing rotate and fix revoke
fixFile('src/core/domain/DeviceSession.ts', c => {
  if (!c.includes('public rotate(')) {
    c = c.replace(
      'public revoke(reason: string): void {',
      "public rotate(newSessionId: string, newHashedRefreshToken: string, ipAddress: string, userAgent: string, expiresAt: Date, now: Date): DeviceSession {\n    return new DeviceSession(newSessionId, this.userId, newHashedRefreshToken, ipAddress, userAgent, expiresAt, now, false);\n  }\n\n  public revoke(reason: string = 'revoked'): void {"
    );
  }
  return c;
});

// 5. RefreshTokenService.ts expecting no argument for revoke()
// Already fixed if revoke defaults to 'revoked' now!

// 6. auth.routes.ts unused imports
fixFile('src/modules/auth/routes/auth.routes.ts', c => {
  let s = c;
  s = s.replace(/import \{ PermissionResolver \} from '\.\.\/engine\/PermissionResolver';\n/, '');
  s = s.replace(/const permissionRepository = new PrismaPermissionRepository\(prisma\);\n/, '');
  return s;
});

// 7. LoginService.ts - Unnecessary escape character \=
fixFile('src/modules/auth/services/LoginService.ts', c =>
  c.replace(/\\\\=/g, '=').replace(/\\=/g, '=')
);

// 8. _ unused variables
// Just add // eslint-disable-next-line @typescript-eslint/no-unused-vars above them or change _ to err if not used
fixFile('src/modules/auth/middleware/requireAuth.ts', c => c.replace(/catch \(_\) \{/g, 'catch (err) {\n      // eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const _err = err;'));
fixFile('src/modules/auth/repositories/PrismaRoleRepository.ts', c => c.replace(/catch \(_\) \{/g, 'catch (err) {\n      // eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const _err = err;'));
fixFile('src/modules/auth/repositories/PrismaUserRepository.ts', c => c.replace(/catch \(_\) \{/g, 'catch (err) {\n      // eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const _err = err;'));
fixFile('src/modules/auth/services/RefreshTokenService.ts', c => c.replace(/catch \(_\) \{/g, 'catch (err) {\n      // eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const _err = err;'));

// 9. any
fixFile('src/modules/auth/engine/PermissionResolver.ts', c => c.replace(/\(roles: any\[\]\)/g, '(roles: unknown[])'));
fixFile('src/modules/auth/middleware/requireAuth.ts', c => c.replace(/\(req as any\)/g, '(req as unknown as { user: unknown })'));

// 10. UserRole mapper unused
fixFile('src/infrastructure/database/mapper.ts', c => c.replace(/import \{.*?UserRole.*?\} from '@prisma\/client';/, 'import { User, DeviceSession, AuditLog, PasswordResetToken, EmailVerificationToken, Role, Permission } from \'@prisma/client\';'));
