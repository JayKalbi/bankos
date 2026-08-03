const fs = require('fs');

// 1. Fix requireAuth.ts
let c1 = fs.readFileSync('src/modules/auth/middleware/requireAuth.ts', 'utf8');
c1 = c1.replace(/userId, req\.path/g, 'payload.sub, req.path');
fs.writeFileSync('src/modules/auth/middleware/requireAuth.ts', c1);

// 2. Fix CreatePermissionService.ts
let c3 = fs.readFileSync('src/modules/auth/services/CreatePermissionService.ts', 'utf8');
c3 = c3.replace(/new PermissionCreated\(permission\.id, name, description\)/g, 'new PermissionCreated(permission.id, name, request.description || \'\')');
fs.writeFileSync('src/modules/auth/services/CreatePermissionService.ts', c3);

// 3. Fix PermissionResolver.ts
let c7 = fs.readFileSync('src/modules/auth/engine/PermissionResolver.ts', 'utf8');
c7 = c7.replace(/\(this\.roleCache as any\)\.keys\(\)/g, 'this.roleCache.keys()');
fs.writeFileSync('src/modules/auth/engine/PermissionResolver.ts', c7);
