const fs = require('fs');

// 1. Fix requireAuth.ts
let c1 = fs.readFileSync('src/modules/auth/middleware/requireAuth.ts', 'utf8');
c1 = c1.replace(/userId, req\.path, /g, 'payload.sub, req.path, ');
c1 = c1.replace(/payload\.sub, req\.path, \{ requiredAny: requiredPermissions, actual: payload\.permissions \}/g, 'payload.sub, req.path, JSON.stringify({ requiredAny: requiredPermissions, actual: payload.permissions })');
c1 = c1.replace(/payload\.sub, req\.path, \{ requiredAll: requiredPermissions, actual: payload\.permissions \}/g, 'payload.sub, req.path, JSON.stringify({ requiredAll: requiredPermissions, actual: payload.permissions })');
fs.writeFileSync('src/modules/auth/middleware/requireAuth.ts', c1);

// 2. Fix AssignPermissionService.ts
let c2 = fs.readFileSync('src/modules/auth/services/AssignPermissionService.ts', 'utf8');
c2 = c2.replace(/new PermissionAssigned\(roleId, permission\)/g, 'new PermissionAssigned(roleId, permissionId)');
fs.writeFileSync('src/modules/auth/services/AssignPermissionService.ts', c2);

// 3. Fix CreatePermissionService.ts
let c3 = fs.readFileSync('src/modules/auth/services/CreatePermissionService.ts', 'utf8');
c3 = c3.replace(/new PermissionCreated\(name, description\)/g, 'new PermissionCreated(permission.id, name, description)');
fs.writeFileSync('src/modules/auth/services/CreatePermissionService.ts', c3);

// 4. Fix RemovePermissionService.ts
let c4 = fs.readFileSync('src/modules/auth/services/RemovePermissionService.ts', 'utf8');
c4 = c4.replace(/new PermissionRemoved\(roleId, permission\)/g, 'new PermissionRemoved(roleId, permissionId)');
fs.writeFileSync('src/modules/auth/services/RemovePermissionService.ts', c4);

// 5. Fix DeviceSession.ts
let c5 = fs.readFileSync('src/core/domain/DeviceSession.ts', 'utf8');
c5 = c5.replace(/reason: string = 'revoked'/g, 'reason = \'revoked\'');
fs.writeFileSync('src/core/domain/DeviceSession.ts', c5);

// 6. Fix mapper.ts
let c6 = fs.readFileSync('src/infrastructure/database/mapper.ts', 'utf8');
c6 = c6.replace(/  UserRole,\n/g, '');
fs.writeFileSync('src/infrastructure/database/mapper.ts', c6);

// 7. Fix PermissionResolver.ts
let c7 = fs.readFileSync('src/modules/auth/engine/PermissionResolver.ts', 'utf8');
c7 = c7.replace(/Array\.from\(\(this\.roleCache as any\)\.keys\(\)\)/g, 'Array.from(this.roleCache.keys())');
fs.writeFileSync('src/modules/auth/engine/PermissionResolver.ts', c7);

// 8. Fix auth.routes.ts
let c8 = fs.readFileSync('src/modules/auth/routes/auth.routes.ts', 'utf8');
c8 = c8.replace(/  PrismaPermissionRepository,\n/g, '');
fs.writeFileSync('src/modules/auth/routes/auth.routes.ts', c8);
