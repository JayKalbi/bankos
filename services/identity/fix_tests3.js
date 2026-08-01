const fs = require('fs');
const glob = require('glob');
const files = glob.sync('tests/modules/auth/services/*.test.ts', { cwd: 'D:/BankOS/services/identity', absolute: true });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace IAuditRepository import with IDomainEventDispatcher and IRandomGenerator
  content = content.replace(
    /import { IAuditRepository } from '(.*?)';/,
    "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';"
  );
  
  // Clean up any double imports if IRandomGenerator was already there
  content = content.replace(/import { IRandomGenerator } from '(.*?)';\r?\nimport { IRandomGenerator } from '(.*?)';/, "import { IRandomGenerator } from '$1';");

  // Type definition replacements
  content = content.replace(/let auditRepository: Mocked<IAuditRepository>;/, 'let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;');
  content = content.replace(/Mocked<IAuditRepository>/g, 'jest.Mocked<IDomainEventDispatcher>');
  
  // Existing randomGenerator type update
  content = content.replace(/let randomGenerator: Mocked<IRandomGenerator>;/, 'let randomGenerator: jest.Mocked<IRandomGenerator>;');
  
  // Replace instantiation
  content = content.replace(/auditRepository = \{\s*save: jest\.fn\(\),?\s*\};/, `eventDispatcher = {\n      dispatch: jest.fn(),\n    };\n    if (!randomGenerator) {\n      randomGenerator = {\n        generateToken: jest.fn(),\n        generateUUID: jest.fn().mockReturnValue('mock-uuid'),\n        hashString: jest.fn(x => x + '-hashed')\n      };\n    }`);
  
  // Update randomGenerator assignment if it existed
  content = content.replace(/randomGenerator = \{\s*generateToken: jest\.fn\(\),?\s*\};/, `randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue('mock-uuid'),\n      hashString: jest.fn(x => x + '-hashed')\n    };`);

  // Replace auditRepository arguments
  content = content.replace(/auditRepository,/g, 'eventDispatcher,');
  content = content.replace(/auditRepository/g, 'eventDispatcher'); // For expect(auditRepository.save) -> expect(eventDispatcher.save)
  content = content.replace(/eventDispatcher\.save/g, 'eventDispatcher.dispatch'); // Fix the method call
  
  // Fix arguments for services that gained randomGenerator before clock
  if (file.includes('LoginService.test.ts') || 
      file.includes('RefreshTokenService.test.ts') || 
      file.includes('LogoutService.test.ts') || 
      file.includes('VerifyEmailService.test.ts') ||
      file.includes('ResetPasswordService.test.ts')) {
    content = content.replace(/eventDispatcher,\n\s*clock/g, 'eventDispatcher,\n      randomGenerator,\n      clock');
  }

  // Remove duplicate var declarations from dirty run just in case
  content = content.replace(/let randomGenerator: jest.Mocked<IRandomGenerator>;\s*let randomGenerator: jest.Mocked<IRandomGenerator>;/g, 'let randomGenerator: jest.Mocked<IRandomGenerator>;');

  fs.writeFileSync(file, content, 'utf-8');
}
