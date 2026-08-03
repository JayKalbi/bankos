const fs = require('fs');

// 1. Fix requireAuth.ts
let c1 = fs.readFileSync('src/modules/auth/middleware/requireAuth.ts', 'utf8');
c1 = c1.replace(/userId/g, 'payload.sub');
fs.writeFileSync('src/modules/auth/middleware/requireAuth.ts', c1);

// 2. Fix CreatePermissionService.ts
let c2 = fs.readFileSync('src/modules/auth/services/CreatePermissionService.ts', 'utf8');
c2 = c2.replace(/new PermissionCreated\(permission, description\)/g, 'new PermissionCreated(permission.id, permission.name, permission.description)');
fs.writeFileSync('src/modules/auth/services/CreatePermissionService.ts', c2);

// 3. Fix auth.routes.ts
let c3 = fs.readFileSync('src/modules/auth/routes/auth.routes.ts', 'utf8');
c3 = c3.replace(/import \{ PrismaPermissionRepository \} from '\.\.\/repositories\/PrismaPermissionRepository';\n/g, '');
fs.writeFileSync('src/modules/auth/routes/auth.routes.ts', c3);
