const fs = require('fs');
const path = require('path');

const basePath = 'D:/BankOS/services/identity/tests/modules/auth/services';

const fixes = {
  'ForgotPasswordService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn().mockReturnValue('72616e646f6d2d62797465732d6d6f636b'),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: /randomGenerator = \{\s*generateToken: jest\.fn\(\)\.mockReturnValue\('72616e646f6d2d62797465732d6d6f636b'\), \/\/ hex of 'random-bytes-mock'\s*\};/,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "randomGenerator,\n      clock,\n      auditRepository",
    constructorNew: "randomGenerator,\n      clock,\n      eventDispatcher",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'LoginService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: null, // Didn't have one
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "deviceSessionRepository,\n      auditRepository,\n      clock",
    constructorNew: "deviceSessionRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'LogoutService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: null,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "deviceSessionRepository,\n      auditRepository,\n      clock",
    constructorNew: "deviceSessionRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'RefreshTokenService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: null,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "deviceSessionRepository,\n      auditRepository,\n      clock",
    constructorNew: "deviceSessionRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'RegisterUserService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn().mockReturnValue('mock-verification-token'),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: /randomGenerator = \{\s*generateToken: jest\.fn\(\)\.mockReturnValue\('mock-verification-token'\),\s*\};/,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "randomGenerator,\n      emailTokenRepository,\n      clock,\n      auditRepository",
    constructorNew: "randomGenerator,\n      emailTokenRepository,\n      eventDispatcher,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'ResetPasswordService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: null,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "passwordResetTokenRepository,\n      auditRepository,\n      clock",
    constructorNew: "passwordResetTokenRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'SendVerificationEmailService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let randomGenerator: jest.Mocked<IRandomGenerator>;\n  let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn().mockReturnValue('mock-verification-token'),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: /randomGenerator = \{\s*generateToken: jest\.fn\(\)\.mockReturnValue\('mock-verification-token'\),\s*\};/,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "randomGenerator,\n      clock,\n      auditRepository",
    constructorNew: "randomGenerator,\n      clock,\n      eventDispatcher",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  },
  'VerifyEmailService.test.ts': {
    imports: "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';",
    removeImport: /import \{ IAuditRepository \} from '.*?';/,
    declarations: "let eventDispatcher: jest.Mocked<IDomainEventDispatcher>;\n  let randomGenerator: jest.Mocked<IRandomGenerator>;",
    removeDeclarations: /let auditRepository: jest\.Mocked<IAuditRepository>;/,
    randomGeneratorInit: `randomGenerator = {
      generateToken: jest.fn(),
      generateUUID: jest.fn().mockReturnValue('mock-uuid'),
      hashString: jest.fn(x => x + '-hashed')
    };`,
    removeRandomGeneratorInit: null,
    auditInit: "eventDispatcher = { dispatch: jest.fn() };",
    removeAuditInit: /auditRepository = \{\s*save: jest\.fn\(\),\s*\};/,
    constructorOld: "emailTokenRepository,\n      auditRepository,\n      clock",
    constructorNew: "emailTokenRepository,\n      eventDispatcher,\n      randomGenerator,\n      clock",
    usages: [
      [/expect\(auditRepository\.save\)/g, 'expect(eventDispatcher.dispatch)']
    ]
  }
};

for (const [filename, config] of Object.entries(fixes)) {
  const filePath = path.join(basePath, filename);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');

  // Imports
  if (config.removeImport) {
    content = content.replace(config.removeImport, config.imports);
  }

  // Ensure IRandomGenerator is imported if not already, and cleanup duplicates
  if (!content.includes('import { IRandomGenerator }')) {
     content = content.replace(/(import .*;\r?\n)(import { IUserRepository })/, `$1import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';\n$2`);
  }
  content = content.replace(/import { IRandomGenerator } from '.*?';\r?\nimport { IRandomGenerator } from '.*?';/g, "import { IRandomGenerator } from '../../../../src/modules/auth/interfaces/IRandomGenerator';");

  // Same for eventDispatcher duplicate imports
  content = content.replace(/import { IDomainEventDispatcher } from '.*?';\r?\nimport { IDomainEventDispatcher } from '.*?';/g, "import { IDomainEventDispatcher } from '../../../../src/modules/auth/interfaces/IDomainEventDispatcher';");

  // Declarations
  if (config.removeDeclarations) {
    content = content.replace(config.removeDeclarations, config.declarations);
  } else {
    // Inject declarations if we couldn't remove auditRepository
    if (!content.includes('let eventDispatcher')) {
       content = content.replace(/let clock: jest.Mocked<IClock>;/, `let clock: jest.Mocked<IClock>;\n  ${config.declarations}`);
    }
  }

  // Ensure Mocked<IClock> is there and Mocked is just Mocked if jest is global, or jest.Mocked
  // Just rewrite Mocked<... to jest.Mocked<... globally where missing
  content = content.replace(/(?<!jest\.)Mocked</g, 'jest.Mocked<');
  content = content.replace(/jest\.jest\.Mocked/g, 'jest.Mocked');

  // Init Event Dispatcher
  if (config.removeAuditInit && content.match(config.removeAuditInit)) {
    content = content.replace(config.removeAuditInit, config.auditInit);
  } else if (!content.includes('eventDispatcher = ')) {
     content = content.replace(/clock = \{[\s\S]*?\};/, `clock = { now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')), unix: jest.fn().mockReturnValue(1767225600) };\n    ${config.auditInit}`);
  }

  // Init Random Generator
  if (config.removeRandomGeneratorInit && content.match(config.removeRandomGeneratorInit)) {
    content = content.replace(config.removeRandomGeneratorInit, config.randomGeneratorInit);
  } else if (!content.includes('randomGenerator = ')) {
    content = content.replace(config.auditInit, `${config.auditInit}\n    ${config.randomGeneratorInit}`);
  }

  // Constructor
  if (config.constructorOld && content.includes(config.constructorOld)) {
    content = content.replace(config.constructorOld, config.constructorNew);
  }

  // Usages
  if (config.usages) {
    for (const usage of config.usages) {
      content = content.replace(usage[0], usage[1]);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}
