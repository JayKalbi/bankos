const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');

c = c.replace(/expect\(deviceSessionRepository\.save\)\.toHaveBeenCalledTimes\(1\);\s*expect\(eventDispatcher\.dispatch\)\.toHaveBeenCalledTimes\(1\); \/\/ TokenRotated/g, 'expect(deviceSessionRepository.save).toHaveBeenCalledTimes(2);\n    expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(1); // TokenRotated');

fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
