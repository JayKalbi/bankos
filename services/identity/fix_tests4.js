const fs = require('fs');
const glob = require('glob');

const files = glob.sync('tests/modules/auth/services/*.test.ts', { cwd: 'D:/BankOS/services/identity', absolute: true });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // Remove duplicate imports
  content = content.replace(/import { IDomainEventDispatcher } from '.*';\r?\nimport { IDomainEventDispatcher } from '.*';/g, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';");
  content = content.replace(/import { IRandomGenerator } from '.*';\r?\nimport { IRandomGenerator } from '.*';/g, "import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");
  
  // Fix jest.jest.Mocked
  content = content.replace(/jest\.jest\.Mocked/g, 'jest.Mocked');
  
  // Fix Mocked
  content = content.replace(/Mocked<IRandomGenerator>/g, 'jest.Mocked<IRandomGenerator>');
  content = content.replace(/Mocked<IDomainEventDispatcher>/g, 'jest.Mocked<IDomainEventDispatcher>');
  content = content.replace(/jest\.jest\.Mocked/g, 'jest.Mocked'); // Just in case it was created

  // Fix randomGenerator missing properties if not already there
  if (content.includes('generateToken: jest.fn()') && !content.includes('generateUUID: jest.fn()')) {
    content = content.replace(/generateToken: jest\.fn\(\),?/g, 'generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn(x => x + "-hashed")');
  }

  // Ensure randomGenerator exists in beforeEach for ForgotPasswordService
  if (file.includes('ForgotPasswordService.test.ts') || file.includes('SendVerificationEmailService.test.ts') || file.includes('RegisterUserService.test.ts')) {
    if (!content.includes('hashString: jest.fn')) {
        content = content.replace(/randomGenerator = \{\s*generateToken: jest\.fn\(\),?\s*\};/, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn(x => x + "-hashed")\n    };');
    }
  }
  
  fs.writeFileSync(file, content, 'utf-8');
}
