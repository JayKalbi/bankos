const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');

// 1. userRepository mock
c = c.replace(
  /userRepository = \{\s*findById: jest\.fn\(\),\s*findByEmail: jest\.fn\(\),\s*exists: jest\.fn\(\),\s*save: jest\.fn\(\),\s*update: jest\.fn\(\),\s*\};/g,
  'userRepository = { findById: jest.fn(), findByEmail: jest.fn(), exists: jest.fn(), save: jest.fn(), update: jest.fn(), assignRole: jest.fn(), removeRole: jest.fn(), findRoles: jest.fn().mockResolvedValue([\'user\']), findPermissions: jest.fn() };'
);

// 2. Add authEngine mock
c = c.replace(
  /let clock: jest\.Mocked<IClock>;/,
  'let clock: jest.Mocked<IClock>;\n  let authEngine: any;'
);
c = c.replace(
  /clock = \{\s*now: jest\.fn\(\)\.mockReturnValue\(new Date\('2026-01-01T00:00:00\.000Z'\)\),\s*unix: jest\.fn\(\)\.mockReturnValue\(1767225600\),\s*\};/g,
  'clock = {\n      now: jest.fn().mockReturnValue(new Date(\'2026-01-01T00:00:00.000Z\')),\n      unix: jest.fn().mockReturnValue(1767225600),\n    };\n\n    authEngine = {\n      resolveRoles: jest.fn().mockResolvedValue([\'user\']),\n      resolvePermissions: jest.fn().mockResolvedValue([\'read:account\']),\n    };'
);

// 3. Update constructor
c = c.replace(
  /refreshTokenService = new RefreshTokenService\([\s\S]*?clock\s*\);/m,
  'refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);'
);

// 4. Update execute calls
c = c.replace(/refreshTokenService\.execute\(request\)/g, 'refreshTokenService.execute(request.refreshToken, request.ipAddress, request.userAgent)');

// 5. Update user mock
c = c.replace(/new User\('user-id', 'test@test\.com', 'hash', \['user'\]\)/g, 'new User(\'user-id\', \'test@test.com\', \'hash\', false, 0, false, false)');

// 6. fix findById to findByRefreshToken
c = c.replace(/deviceSessionRepository\.findById\.mockResolvedValue/g, 'deviceSessionRepository.findByRefreshToken.mockResolvedValue');

// 7. add findActiveSessions mock for replay test
c = c.replace(/deviceSessionRepository\.findByRefreshToken\.mockResolvedValue\(session\);/g, 'deviceSessionRepository.findByRefreshToken.mockResolvedValue(session);\n    deviceSessionRepository.findActiveSessions.mockResolvedValue([session]);');

// 8. fix save count for rotate test
c = c.replace(/expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(1\);\n\s*expect\(eventDispatcher\.dispatch\)\.toHaveBeenCalledTimes\(1\); \/\/ TokenRotated/g, 'expect(deviceSessionRepository.save).toHaveBeenCalledTimes(2);\n    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1); // TokenRotated');

fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
