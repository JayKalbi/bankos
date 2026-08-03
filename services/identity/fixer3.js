const fs = require('fs');

let content = fs.readFileSync('src/modules/auth/routes/auth.routes.ts', 'utf8');

if (!content.includes('import { AuthorizationEngine }')) {
  content = content.replace(
    '// Application Services',
    "// Engine\nimport { AuthorizationEngine } from '../engine/AuthorizationEngine';\nimport { PermissionResolver } from '../engine/PermissionResolver';\nimport { PrismaPermissionRepository } from '../repositories/PrismaPermissionRepository';\n\n// Application Services"
  );
}

if (!content.includes('const permissionResolver')) {
  content = content.replace(
    '// Setup Event Dispatcher',
    "// Setup Engine\nconst permissionRepository = new PrismaPermissionRepository(prisma);\nconst permissionResolver = new PermissionResolver(roleRepository, permissionRepository);\nconst authEngine = new AuthorizationEngine(permissionResolver);\n\n// Setup Event Dispatcher"
  );
}

content = content.replace(
  'const loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock);',
  'const loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock, authEngine);'
);

content = content.replace(
  'const refreshTokenService = new RefreshTokenService(userRepository, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock);',
  'const refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);'
);

fs.writeFileSync('src/modules/auth/routes/auth.routes.ts', content);
