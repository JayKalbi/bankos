const fs = require('fs');
const path = require('path');

const servicesDir = path.join(process.cwd(), 'src', 'modules', 'auth', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  content = content.replace(/^import \* as crypto from 'crypto';\r?\n?/m, '');

  if (!content.includes('IDomainEventDispatcher')) {
    content = content.replace(/^import {/m, "import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';\nimport {");
  }
  if (!content.includes('IRandomGenerator')) {
    content = content.replace(/^import {/m, "import { IRandomGenerator } from '../interfaces/IRandomGenerator';\nimport {");
  }

  content = content.replace(/^import { IAuditRepository }.*?\r?\n/m, '');
  content = content.replace(/^import { AuditEvent }.*?\r?\n/m, '');

  if (!content.includes('eventDispatcher: IDomainEventDispatcher')) {
    content = content.replace(
      /private readonly auditRepository: IAuditRepository/g,
      'private readonly eventDispatcher: IDomainEventDispatcher,\n    private readonly randomGenerator: IRandomGenerator'
    );
  }

  content = content.replace(/crypto\.randomUUID\(\)/g, 'this.randomGenerator.generateUUID()');
  content = content.replace(/crypto\.createHash\('[^']+'\)\.update\(([^)]+)\)\.digest\('[^']+'\)/g, 'this.randomGenerator.hashString($1)');

  // Custom regex mapping for loop replacements based on file context
  let loopRegex;
  let replacePattern;

  if (file === 'LoginService.ts' || file === 'RegisterUserService.ts' || file === 'ForgotPasswordService.ts') {
    loopRegex = /for\s*\(\s*const\s+event\s+of\s+user\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*user\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();`;
  } else if (file === 'ResetPasswordService.ts') {
    loopRegex = /for\s*\(\s*const\s+event\s+of\s+user\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*user\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();`;
    content = content.replace(loopRegex, replacePattern);

    loopRegex = /for\s*\(\s*const\s+event\s+of\s+session\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*session\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of session.domainEvents) {
          event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
        }
        await this.eventDispatcher.dispatch(session.domainEvents);
        session.clearEvents();`;
  } else if (file === 'LogoutService.ts') {
    loopRegex = /for\s*\(\s*const\s+event\s+of\s+deviceSession\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*deviceSession\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of deviceSession.domainEvents) {
          event.metadata = { ipAddress, userAgent };
        }
        await this.eventDispatcher.dispatch(deviceSession.domainEvents);
        deviceSession.clearEvents();`;
  } else if (file === 'RefreshTokenService.ts') {
    loopRegex = /for\s*\(\s*const\s+event\s+of\s+oldSession\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*oldSession\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of oldSession.domainEvents) {
        event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
      }
      await this.eventDispatcher.dispatch(oldSession.domainEvents);
      oldSession.clearEvents();`;
    content = content.replace(loopRegex, replacePattern);

    loopRegex = /for\s*\(\s*const\s+event\s+of\s+user\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*user\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of user.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(user.domainEvents);
    user.clearEvents();`;
  } else if (file === 'VerifyEmailService.ts') {
    loopRegex = /for\s*\(\s*const\s+event\s+of\s+verificationToken\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*verificationToken\.clearEvents\(\);?/gm;
    replacePattern = `for (const event of verificationToken.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(verificationToken.domainEvents);
    verificationToken.clearEvents();`;
  }

  if (loopRegex && replacePattern) {
    content = content.replace(loopRegex, replacePattern);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}
