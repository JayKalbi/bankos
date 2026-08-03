const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. Fix RefreshTokenService.test.ts mocks back to findByRefreshToken
fixFile('tests/modules/auth/services/RefreshTokenService.test.ts', c =>
  c.replace(/findByRefreshTokenHash/g, 'findByRefreshToken')
);

// 2. Fix LoginService.ts DUMMY_HASH
fixFile('src/modules/auth/services/LoginService.ts', c =>
  c.replace(/private static readonly DUMMY_HASH = '.*';/, "private static readonly DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$GKA/RZv83E8zMBbJ2CVpao0uZQWlLWfwBWo';")
);
