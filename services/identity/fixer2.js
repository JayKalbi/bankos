const fs = require('fs');

let content = fs.readFileSync('src/modules/auth/services/RefreshTokenService.ts', 'utf8');
content = content.replace('this.deviceSessionRepository.findByToken(hashedToken)', 'this.deviceSessionRepository.findByRefreshToken(hashedToken)');
content = content.replace('this.deviceSessionRepository.findByUserId(userId)', 'this.deviceSessionRepository.findActiveSessions(userId)');
fs.writeFileSync('src/modules/auth/services/RefreshTokenService.ts', content);
