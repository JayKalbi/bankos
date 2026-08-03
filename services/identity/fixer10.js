const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. AuthController.test.ts
fixFile('tests/modules/auth/controllers/AuthController.test.ts', c =>
  c.replace(
    'expect(refreshTokenService.execute).toHaveBeenCalledWith(req.body);',
    "expect(refreshTokenService.execute).toHaveBeenCalledWith('valid-refresh-token', '127.0.0.1', 'Jest');"
  )
);

// 2. RegisterUserService.test.ts
fixFile('tests/modules/auth/services/RegisterUserService.test.ts', c => {
  let s = c;
  s = s.replace(
    /roleRepository = \{\s*findByName: jest\.fn\(\),?\s*\};/g,
    "roleRepository = { findByName: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), assignPermission: jest.fn(), removePermission: jest.fn(), findPermissions: jest.fn(), findAll: jest.fn(), findById: jest.fn() };"
  );
  return s;
});

// 3. LoginService.test.ts (user constructor has 8 args)
fixFile('tests/modules/auth/services/LoginService.test.ts', c => {
  return c.replace(
    /new User\('123', 'test@example\.com', 'hash', (true|false), 0, false, false, false\)/g,
    "new User('123', 'test@example.com', 'hash', \, 0, false, false)"
  );
});

// 4. RefreshTokenService.test.ts (findByRefreshToken instead of findByRefreshTokenHash)
fixFile('tests/modules/auth/services/RefreshTokenService.test.ts', c =>
  c.replace(/findByRefreshToken:/g, 'findByRefreshTokenHash:')
);
