const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');

// 1. Update execute calls
c = c.replace(/refreshTokenService\.execute\(request\)/g, 'refreshTokenService.execute(request.refreshToken, request.ipAddress, request.userAgent)');

// 2. Update user mock
c = c.replace(/new User\('user-id', 'test@test\.com', 'hash', \['user'\]\)/g, 'new User(\'user-id\', \'test@test.com\', \'hash\', false, 0, false, false)');

// 3. Fix isRevoked to have save count 1
c = c.replace(/expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(1\);/g, 'expect(deviceSessionRepository.save).toHaveBeenCalledTimes(2);');
c = c.replace(/expect\(session\.isRevoked\)\.toBe\(true\);\n\s*expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(2\);/g, 'expect(session.isRevoked).toBe(true);\n    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);');

// 4. Add indActiveSessions mock for the replay test
c = c.replace(/deviceSessionRepository\.findByRefreshToken\.mockResolvedValue\(session\);/g, 'deviceSessionRepository.findByRefreshToken.mockResolvedValue(session);\n    deviceSessionRepository.findActiveSessions.mockResolvedValue([session]);');

fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
