const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. DeviceSession.ts isExpired
fixFile('src/core/domain/DeviceSession.ts', c =>
  c.replace(/public isExpired\(\): boolean \{/g, 'public isExpired(now?: Date): boolean {')
);

// 2. RefreshTokenService.test.ts
fixFile('tests/modules/auth/services/RefreshTokenService.test.ts', c => {
  let s = c;
  s = s.replace(/refreshTokenService\.execute\(request\)/g, 'refreshTokenService.execute(request.refreshToken, request.ipAddress, request.userAgent)');
  // Fix authEngine not found
  if (!s.includes('let authEngine: any;')) {
    s = s.replace('let userRepository: any;', 'let userRepository: any;\n  let authEngine: any;');
  }
  return s;
});

// 3. LoginService.test.ts
fixFile('tests/modules/auth/services/LoginService.test.ts', c => {
  let s = c;
  if (!s.includes('let authEngine: any;')) {
    s = s.replace('let clock: Mocked<IClock>;', 'let clock: Mocked<IClock>;\n  let authEngine: any;');
  }
  return s;
});

// 4. ResetPasswordService.test.ts mock shape
fixFile('tests/modules/auth/services/ResetPasswordService.test.ts', c => {
  let s = c;
  if (!s.includes('assignRole:')) {
    s = s.replace(
      /update: jest\.fn\(\),\n    \};/,
      'update: jest.fn(),\n      assignRole: jest.fn(),\n      removeRole: jest.fn(),\n      findRoles: jest.fn(),\n      findPermissions: jest.fn(),\n    };'
    );
  }
  return s;
});
