const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');
c = c.replace(/expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(1\);/g, 'expect(deviceSessionRepository.save).toHaveBeenCalledTimes(2);');
fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
