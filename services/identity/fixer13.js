const fs = require('fs');

// 1. Fix RefreshTokenService.test.ts
let rtContent = fs.readFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', 'utf8');
rtContent = rtContent.replace(/findByRefreshToken\./g, 'findByRefreshTokenHash.');
rtContent = rtContent.replace(/findByRefreshToken:/g, 'findByRefreshTokenHash:');
fs.writeFileSync('tests/modules/auth/services/RefreshTokenService.test.ts', rtContent);

// 2. Fix LoginService.test.ts multi-line User
let loginContent = fs.readFileSync('tests/modules/auth/services/LoginService.test.ts', 'utf8');
loginContent = loginContent.replace(/\[\'user\'\],\r?\n\s*/g, '');
fs.writeFileSync('tests/modules/auth/services/LoginService.test.ts', loginContent);
