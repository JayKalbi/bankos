const fs = require('fs');
const glob = require('glob'); // Note: we can just manually list files since glob might not be installed, but fs.readdirSync works.

const files = [
  'tests/modules/auth/services/RegisterUserService.test.ts',
  'tests/modules/auth/services/SendVerificationEmailService.test.ts',
  'tests/modules/auth/repositories/PrismaUserRepository.test.ts',
  'tests/modules/auth/services/VerifyEmailService.test.ts',
  'tests/modules/auth/services/LoginService.test.ts',
  'tests/modules/auth/services/ForgotPasswordService.test.ts',
  'tests/modules/auth/services/ResetPasswordService.test.ts',
  'tests/modules/auth/services/RefreshTokenService.test.ts',
  'tests/modules/auth/services/LogoutService.test.ts',
  'tests/modules/auth/services/AssignPermissionService.test.ts',
  'tests/modules/auth/services/AssignRoleService.test.ts',
  'tests/modules/auth/services/CreatePermissionService.test.ts',
  'tests/modules/auth/services/CreateRoleService.test.ts',
  'tests/modules/auth/services/RemovePermissionService.test.ts',
  'tests/modules/auth/services/RemoveRoleService.test.ts',
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');

    // Fix userRepository mocks
    c = c.replace(
      /userRepository = \{\s+findById: jest\.fn\(\),\s+findByEmail: jest\.fn\(\),\s+exists: jest\.fn\(\),\s+save: jest\.fn\(\),\s+update: jest\.fn\(\),?\s*\};/g,
      "userRepository = { findById: jest.fn(), findByEmail: jest.fn(), exists: jest.fn(), save: jest.fn(), update: jest.fn(), assignRole: jest.fn(), removeRole: jest.fn(), findRoles: jest.fn(), findPermissions: jest.fn() };"
    );

    // Also fix any other userRepository mock variant
    c = c.replace(
      /userRepository = \{\s+findById: jest\.fn\(\),\s+findRoles: jest\.fn\(\)\.mockResolvedValue\(\['user'\]\),?\s*\};/g,
      "userRepository = { findById: jest.fn(), findByEmail: jest.fn(), exists: jest.fn(), save: jest.fn(), update: jest.fn(), assignRole: jest.fn(), removeRole: jest.fn(), findRoles: jest.fn().mockResolvedValue(['user']), findPermissions: jest.fn() };"
    );

    // Fix User constructors taking arrays: new User('id', 'email', 'hash', ['user'] ...)
    c = c.replace(/new User\('([^']+)', '([^']+)', '([^']+)', \[\],/g, "new User('\', '\', '\',");
    c = c.replace(/new User\('([^']+)', '([^']+)', '([^']+)', \['[^']+'\]\)/g, "new User('\', '\', '\', false, 0, false, false)");
    c = c.replace(/new User\('([^']+)', '([^']+)', '([^']+)', \['[^']+'\], /g, "new User('\', '\', '\', ");

    fs.writeFileSync(f, c);
  }
}

// RegisterUserService duplicate findByName
let registerContent = fs.readFileSync('tests/modules/auth/services/RegisterUserService.test.ts', 'utf8');
registerContent = registerContent.replace(/findByName: jest\.fn\(\),\s+findByName: jest\.fn\(\),/, 'findByName: jest.fn(),');
fs.writeFileSync('tests/modules/auth/services/RegisterUserService.test.ts', registerContent);

// LoginService fixes
let loginContent = fs.readFileSync('tests/modules/auth/services/LoginService.test.ts', 'utf8');
if (!loginContent.includes('let authEngine: any;')) {
  loginContent = loginContent.replace(/let clock:/, 'let authEngine: any;\n  let clock:');
}
loginContent = loginContent.replace(/loginService = new LoginService\([\s\S]*?clock\s*\);/m,
  "loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock, authEngine);"
);
// Make sure authEngine is initialized if it's not
if (!loginContent.includes('authEngine = {')) {
   loginContent = loginContent.replace(/clock = \{/, "authEngine = { resolveRoles: jest.fn().mockResolvedValue(['user']), resolvePermissions: jest.fn().mockResolvedValue(['read:account']) };\n    clock = {");
}
fs.writeFileSync('tests/modules/auth/services/LoginService.test.ts', loginContent);

// RefreshTokenService fixes
let refreshContent = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');
if (!refreshContent.includes('let authEngine: any;')) {
  refreshContent = refreshContent.replace(/let clock:/, 'let authEngine: any;\n  let clock:');
}
refreshContent = refreshContent.replace(/refreshTokenService = new RefreshTokenService\([\s\S]*?clock\s*\);/m,
  "refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);"
);
// Make sure authEngine is initialized if it's not
if (!refreshContent.includes('authEngine = {')) {
   refreshContent = refreshContent.replace(/clock = \{/, "authEngine = { resolveRoles: jest.fn().mockResolvedValue(['user']), resolvePermissions: jest.fn().mockResolvedValue(['read:account']) };\n    clock = {");
}
fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', refreshContent);
