const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. RefreshTokenService.test.ts
fixFile('tests/modules/auth/services/RefreshTokenService.test.ts', c =>
  c.replace(/findByRefreshTokenHash:/g, 'findByRefreshToken:')
);

// 2. LoginService.test.ts (User constructor 8 -> 7 args)
fixFile('tests/modules/auth/services/LoginService.test.ts', c => {
  // Replace the 8 arg version with 7 args by removing the extra boolean.
  return c.replace(/new User\('([^']+)', '([^']+)', '([^']+)', ([^,]+), ([^,]+), ([^,]+), ([^,]+), ([^,)]+)\)/g, "new User('$1', '$2', '$3', $4, $5, $6, $7)");
});

// 3. compilation errors in AssignPermissionService, AssignRoleService, etc.
const resetMap = {
  'AssignPermissionService.ts': "await this.eventDispatcher.dispatch([new PermissionAssigned(roleId, permission)]);",
  'AssignRoleService.ts': "await this.eventDispatcher.dispatch([new RoleAssignedToUser(userId, roleName)]);",
  'CreatePermissionService.ts': "await this.eventDispatcher.dispatch([new PermissionCreated(permission, description)]);",
  'CreateRoleService.ts': "await this.eventDispatcher.dispatch([new RoleCreated(role.id, role.name)]);",
  'RemovePermissionService.ts': "await this.eventDispatcher.dispatch([new PermissionRemoved(roleId, permission)]);",
  'RemoveRoleService.ts': "await this.eventDispatcher.dispatch([new RoleRemovedFromUser(userId, roleName)]);"
};
for (const f of Object.keys(resetMap)) {
  fixFile('src/modules/auth/services/' + f, c =>
    c.replace(/await this\.eventDispatcher\.dispatch\([\s\S]*?\);/g, resetMap[f])
  );
}

// 4. requireAuth.ts syntax error
fixFile('src/modules/auth/middleware/requireAuth.ts', c => {
  let s = c;
  s = s.replace(/await dispatcher\.dispatch\([\s\S]*?\]\);/g, "await dispatcher.dispatch([new AuthorizationDenied(userId, 'Insufficient role or permissions')]);");
  return s;
});
