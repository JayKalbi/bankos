const fs = require('fs');
const file = 'src/modules/auth/services/RefreshTokenService.ts';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/^import \* as crypto from 'crypto';\r?\n?/m, '');

if (!content.includes('IDomainEventDispatcher')) {
  content = content.replace(/^import {/m, "import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';\nimport { IRandomGenerator } from '../interfaces/IRandomGenerator';\nimport {");
}

content = content.replace(/^import { IAuditRepository }.*?\r?\n/m, '');
content = content.replace(/^import { AuditEvent }.*?\r?\n/m, '');

content = content.replace(
  /private readonly auditRepository: IAuditRepository/g,
  'private readonly eventDispatcher: IDomainEventDispatcher,\n    private readonly randomGenerator: IRandomGenerator'
);

content = content.replace(/crypto\.randomUUID\(\)/g, 'this.randomGenerator.generateUUID()');
content = content.replace(/crypto\.createHash\('[^']+'\)\.update\(([^)]+)\)\.digest\('[^']+'\)/g, 'this.randomGenerator.hashString($1)');

const loopRegex1 = /for\s*\(\s*const\s+event\s+of\s+deviceSession\.domainEvents\s*\)\s*\{[\s\S]*?(?:if\s*\([^)]*\)\s*\{[\s\S]*?await\s+this\.auditRepository\.save\([^)]*\);?\s*\})?\s*\}\s*deviceSession\.clearEvents\(\);?/gm;
content = content.replace(loopRegex1, `for (const event of deviceSession.domainEvents) {
          event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
        }
        await this.eventDispatcher.dispatch(deviceSession.domainEvents);
        deviceSession.clearEvents();`);

const loopRegex2 = /const auditEvent = new AuditEvent\([\s\S]*?await this\.auditRepository\.save\(auditEvent\);/m;
content = content.replace(loopRegex2, `// Removed explicit audit event since we emit domain events and handle it in dispatcher`);

fs.writeFileSync(file, content, 'utf-8');
