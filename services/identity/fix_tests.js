const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('tests/modules/auth/services/*.test.ts', { cwd: 'D:/BankOS/services/identity', absolute: true });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // Fix IAuditRepository to IDomainEventDispatcher
  content = content.replace(/import { IAuditRepository } from '.*?';/g, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';");
  content = content.replace(/Mocked<IAuditRepository>/g, 'Mocked<IDomainEventDispatcher>');
  content = content.replace(/let auditRepository:/g, 'let eventDispatcher:');
  content = content.replace(/auditRepository = {[\s\S]*?save: jest\.fn\(\),?[\s\S]*?};/g, 'eventDispatcher = {\n      dispatch: jest.fn(),\n    };');
  content = content.replace(/auditRepository,/g, 'eventDispatcher,');

  // Fix randomGenerator missing properties
  content = content.replace(/randomGenerator = \{\s*generateToken: jest\.fn\(\),?\s*\};/g, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };');

  // Fix LoginService arguments
  if (file.includes('LoginService.test.ts') && !content.includes('randomGenerator,')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
    if (!content.includes('let randomGenerator:')) {
      content = content.replace(/let eventDispatcher:/, 'let eventDispatcher: Mocked<IDomainEventDispatcher>;\n  let randomGenerator: Mocked<IRandomGenerator>;');
      content = content.replace(/eventDispatcher = {/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };\n    eventDispatcher = {');
      content = content.replace(/import { IDomainEventDispatcher }/, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
    }
  }

  // Fix RefreshTokenService arguments
  if (file.includes('RefreshTokenService.test.ts') && !content.includes('randomGenerator,')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
    if (!content.includes('let randomGenerator:')) {
      content = content.replace(/let eventDispatcher:/, 'let eventDispatcher: Mocked<IDomainEventDispatcher>;\n  let randomGenerator: Mocked<IRandomGenerator>;');
      content = content.replace(/eventDispatcher = {/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };\n    eventDispatcher = {');
      content = content.replace(/import { IDomainEventDispatcher }/, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
    }
  }

  // Fix LogoutService arguments
  if (file.includes('LogoutService.test.ts') && !content.includes('randomGenerator,')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
    if (!content.includes('let randomGenerator:')) {
      content = content.replace(/let eventDispatcher:/, 'let eventDispatcher: Mocked<IDomainEventDispatcher>;\n  let randomGenerator: Mocked<IRandomGenerator>;');
      content = content.replace(/eventDispatcher = {/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };\n    eventDispatcher = {');
      content = content.replace(/import { IDomainEventDispatcher }/, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
    }
  }

  // Fix VerifyEmailService arguments
  if (file.includes('VerifyEmailService.test.ts') && !content.includes('randomGenerator,')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
    if (!content.includes('let randomGenerator:')) {
      content = content.replace(/let eventDispatcher:/, 'let eventDispatcher: Mocked<IDomainEventDispatcher>;\n  let randomGenerator: Mocked<IRandomGenerator>;');
      content = content.replace(/eventDispatcher = {/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };\n    eventDispatcher = {');
      content = content.replace(/import { IDomainEventDispatcher }/, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
    }
  }

  // Fix ResetPasswordService arguments
  if (file.includes('ResetPasswordService.test.ts') && !content.includes('randomGenerator,')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
    if (!content.includes('let randomGenerator:')) {
      content = content.replace(/let eventDispatcher:/, 'let eventDispatcher: Mocked<IDomainEventDispatcher>;\n  let randomGenerator: Mocked<IRandomGenerator>;');
      content = content.replace(/eventDispatcher = {/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };\n    eventDispatcher = {');
      content = content.replace(/import { IDomainEventDispatcher }/, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
}
