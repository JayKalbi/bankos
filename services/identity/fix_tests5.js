const fs = require('fs');
const glob = require('glob');

const files = glob.sync('tests/modules/auth/services/*.test.ts', { cwd: 'D:/BankOS/services/identity', absolute: true });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Fix Imports
  content = content.replace(
    /import { IAuditRepository } from '.*?';/,
    "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';"
  );
  // Ensure we don't duplicate IRandomGenerator
  content = content.replace(
    /import { IRandomGenerator } from '.*';\s*import { IRandomGenerator } from '.*';/,
    "import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';"
  );

  // 2. Fix variable declarations
  content = content.replace(
    /let auditRepository: Mocked<IAuditRepository>;/,
    'let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;'
  );
  // Ensure we don't have existing duplicate randomGenerator
  content = content.replace(
    /let randomGenerator: Mocked<IRandomGenerator>;\s*let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\s*let randomGenerator: jest.Mocked<IRandomGenerator>;/,
    'let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;'
  );
  // Replace old Mocked<IAuditRepository>
  content = content.replace(/Mocked<IAuditRepository>/g, 'jest.Mocked<IDomainEventDispatcher>');
  // Ensure Mocked<IRandomGenerator> has jest
  content = content.replace(/(?<!jest\.)Mocked<IRandomGenerator>/g, 'jest.Mocked<IRandomGenerator>');

  // 3. Fix object instantiation
  content = content.replace(
    /auditRepository = \{\s*save: jest\.fn\(\),?\s*\};/,
    `eventDispatcher = { dispatch: jest.fn() };\n    if (!randomGenerator) {\n      randomGenerator = {\n        generateToken: jest.fn(),\n        generateUUID: jest.fn().mockReturnValue('mock-uuid'),\n        hashString: jest.fn(x => x + '-hashed')\n      };\n    }`
  );

  content = content.replace(
    /randomGenerator = \{\s*generateToken: jest\.fn\(\),?\s*\};/,
    `randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue('mock-uuid'),\n      hashString: jest.fn(x => x + '-hashed')\n    };`
  );

  // 4. Replace arguments and method calls
  content = content.replace(/auditRepository,/g, 'eventDispatcher,');
  content = content.replace(/auditRepository/g, 'eventDispatcher');
  content = content.replace(/eventDispatcher\.save/g, 'eventDispatcher.dispatch');

  // 5. Add randomGenerator to service constructors if it's missing (for the ones that had audit before clock)
  const servicesNeedingRandomGenerator = ['LoginService', 'RefreshTokenService', 'LogoutService', 'VerifyEmailService', 'ResetPasswordService'];
  const baseName = file.split('/').pop().replace('.test.ts', '');
  if (servicesNeedingRandomGenerator.includes(baseName)) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
  }

  fs.writeFileSync(file, content, 'utf-8');
}
