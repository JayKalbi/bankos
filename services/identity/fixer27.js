const fs = require('fs');
let c = fs.readFileSync('src/modules/auth/engine/PermissionResolver.ts', 'utf8');
c = c.replace(/roles: any\[\]/g, 'roles: { name: string; parents: string[] }[]');
fs.writeFileSync('src/modules/auth/engine/PermissionResolver.ts', c);
