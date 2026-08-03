const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');

c = c.replace(/refreshTokenService = new RefreshTokenService\([\s\S]*?clock\s*\);/m, 'refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);');

fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
