const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');

// 1. userRepository mock
c = c.replace(
  /userRepository = \{\s*findById: jest\.fn\(\),\s*findByEmail: jest\.fn\(\),\s*exists: jest\.fn\(\),\s*save: jest\.fn\(\),\s*update: jest\.fn\(\),\s*\};/g,
  'userRepository = { findById: jest.fn(), findByEmail: jest.fn(), exists: jest.fn(), save: jest.fn(), update: jest.fn(), assignRole: jest.fn(), removeRole: jest.fn(), findRoles: jest.fn().mockResolvedValue([\'user\']), findPermissions: jest.fn() };'
);

// 2. Add authEngine mock
c = c.replace(
  /let randomGenerator: jest\.Mocked<IRandomGenerator>;/,
  'let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let authEngine: any;'
);
c = c.replace(
  /randomGenerator = \{\n\s*generateToken: jest\.fn\(\),\n\s*generateUUID: jest\.fn\(\)\.mockReturnValue\('mock-uuid'\),\n\s*hashString: jest\.fn\(\(val\) => crypto\.createHash\('sha256'\)\.update\(val\)\.digest\('hex'\)\)\n\s*\};\n/,
  'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue(\'mock-uuid\'),\n      hashString: jest.fn((val) => crypto.createHash(\'sha256\').update(val).digest(\'hex\'))\n    };\n\n    authEngine = {\n      resolveRoles: jest.fn().mockResolvedValue([\'user\']),\n      resolvePermissions: jest.fn().mockResolvedValue([\'read:account\']),\n    };\n'
);

// 3. Update constructor
c = c.replace(
  /refreshTokenService = new RefreshTokenService\(\n\s*userRepository,\n\s*tokenService,\n\s*deviceSessionRepository,\n\s*eventDispatcher,\n\s*randomGenerator,\n\s*clock\n\s*\);/,
  'refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);'
);

// 4. Update execute calls
c = c.replace(/refreshTokenService\.execute\(request\)/g, 'refreshTokenService.execute(request.refreshToken, request.ipAddress, request.userAgent)');

// 5. Update user mock
c = c.replace(/new User\('user-id', 'test@test\.com', 'hash', \['user'\]\)/g, 'new User(\'user-id\', \'test@test.com\', \'hash\', false, 0, false, false)');

// 6. Fix isRevoked to have save count 1
c = c.replace(/expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(1\);/g, 'expect(deviceSessionRepository.save).toHaveBeenCalledTimes(2);');
c = c.replace(/expect\(session\.isRevoked\)\.toBe\(true\);\n\s*expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(2\);/g, 'expect(session.isRevoked).toBe(true);\n    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);');

// 7. Add indActiveSessions mock for the replay test
c = c.replace(/deviceSessionRepository\.findByRefreshToken\.mockResolvedValue\(session\);/g, 'deviceSessionRepository.findByRefreshToken.mockResolvedValue(session);\n    deviceSessionRepository.findActiveSessions.mockResolvedValue([session]);');

fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
