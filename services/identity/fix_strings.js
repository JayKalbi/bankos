const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\/g, '\');
  fs.writeFileSync(file, content);
}
fix('src/modules/auth/middleware/requireAuth.ts');
fix('src/modules/auth/repositories/PrismaUserRepository.ts');
fix('src/modules/auth/services/AssignPermissionService.ts');
fix('src/modules/auth/services/AssignRoleService.ts');
fix('src/modules/auth/services/CreatePermissionService.ts');
fix('src/modules/auth/services/CreateRoleService.ts');
