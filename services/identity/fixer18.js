const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');
c = c.replace(/expect\(session\.isRevoked\)\.toBe\(true\);\n    expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(2\);/g, 'expect(session.isRevoked).toBe(true);\n    expect(deviceSessionRepository.save).toHaveBeenCalledTimes(1);');
fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
