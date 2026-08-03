const fs = require('fs');

let c = fs.readFileSync('src/modules/auth/engine/PermissionResolver.ts', 'utf8');

if (!c.includes('import { Role }')) {
  c = "import { Role } from '../../../core/domain/Role';\n" + c;
}

c = c.replace(/roles: \{ name: string; parents: string\[\] \}\[\]/g, 'roles: Role[]');

fs.writeFileSync('src/modules/auth/engine/PermissionResolver.ts', c);
