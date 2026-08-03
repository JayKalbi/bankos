const fs = require('fs');
let c = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');
c = c.replace(/deviceSessionRepository\.findById\.mockResolvedValue/g, 'deviceSessionRepository.findByRefreshToken.mockResolvedValue');
fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', c);
