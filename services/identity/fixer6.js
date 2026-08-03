const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// Mock auth engine in LoginService test
fixFile('tests/modules/auth/services/LoginService.test.ts', c => {
  if (!c.includes('let authEngine:')) {
    c = c.replace(
      'let clock: Mocked<IClock>;',
      "let clock: Mocked<IClock>;\n  let authEngine: any;"
    );
    c = c.replace(
      'clock = {',
      "authEngine = {\n      resolveRoles: jest.fn().mockResolvedValue(['user']),\n      resolvePermissions: jest.fn().mockResolvedValue(['read:account']),\n    };\n    clock = {"
    );
    c = c.replace(
      /loginService = new LoginService\([\s\S]*?clock\n    \);/m,
      "loginService = new LoginService(\n      userRepository,\n      passwordHasher,\n      tokenService,\n      deviceSessionRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock,\n      authEngine\n    );"
    );
  }
  // fix the LoginService.test.ts user constructor issue
  c = c.replace(/new User\('123', 'test@example.com', 'hash', false\)/g, "new User('123', 'test@example.com', 'hash', false, 0, false, false)");
  c = c.replace(/new User\('123', 'test@example.com', 'hash', true\)/g, "new User('123', 'test@example.com', 'hash', true, 0, false, false)");
  return c;
});

// Mock auth engine in RefreshTokenService test
fixFile('tests/modules/auth/services/RefreshTokenService.test.ts', c => {
  if (!c.includes('let authEngine:')) {
    c = c.replace(
      'let clock: Mocked<IClock>;',
      "let clock: Mocked<IClock>;\n  let authEngine: any;\n  let userRepository: any;"
    );
    c = c.replace(
      'clock = {',
      "authEngine = {\n      resolveRoles: jest.fn().mockResolvedValue(['user']),\n      resolvePermissions: jest.fn().mockResolvedValue(['read:account']),\n    };\n    userRepository = {\n      findById: jest.fn(),\n      findRoles: jest.fn().mockResolvedValue(['user']),\n    };\n    clock = {"
    );
    c = c.replace(
      /refreshTokenService = new RefreshTokenService\([\s\S]*?clock\n    \);/m,
      "refreshTokenService = new RefreshTokenService(\n      deviceSessionRepository,\n      tokenService,\n      clock,\n      randomGenerator,\n      eventDispatcher,\n      userRepository,\n      authEngine\n    );"
    );
  }
  // Fix deviceSessionRepository methods
  c = c.replace(/findByToken:/g, 'findByRefreshToken:');
  c = c.replace(/findByUserId:/g, 'findActiveSessions:');
  return c;
});
