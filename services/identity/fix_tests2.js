const fs = require('fs');
const glob = require('glob');

const files = glob.sync('tests/modules/auth/services/*.test.ts', { cwd: 'D:/BankOS/services/identity', absolute: true });

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // Fix the invalid import
  content = content.replace(/import \{ IRandomGenerator \} from '\.\.\/\.\.\/\.\.\/\.\.\/src\/modules\/auth\/interfaces\/IRandomGenerator'; from '\.\.\/\.\.\/\.\.\/\.\.\/src\/modules\/auth\/interfaces\/IDomainEventDispatcher';/g,
    "import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';\nimport { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';");

  // Fix the bad variable declaration
  content = content.replace(/let randomGenerator: Mocked<IRandomGenerator>; jest\.Mocked<IDomainEventDispatcher>;/g,
    "let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;");
  content = content.replace(/let eventDispatcher: Mocked<IDomainEventDispatcher>;/g, '');

  content = content.replace(/Mocked<IDomainEventDispatcher>/g, 'jest.Mocked<IDomainEventDispatcher>');
  content = content.replace(/Mocked<IRandomGenerator>/g, 'jest.Mocked<IRandomGenerator>');

  // Fix auditRepository
  content = content.replace(/auditRepository = \{/g, 'eventDispatcher = {');
  content = content.replace(/auditRepository,/g, 'eventDispatcher,');
  content = content.replace(/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)');

  // Fix randomGenerator missing properties again
  content = content.replace(/randomGenerator = \{\s*generateToken: jest\.fn\(\),?\s*\};/g, 'randomGenerator = {\n      generateToken: jest.fn(),\n      generateUUID: jest.fn().mockReturnValue("mock-uuid"),\n      hashString: jest.fn((str) => str + "-hashed")\n    };');

  fs.writeFileSync(file, content, 'utf-8');
}
