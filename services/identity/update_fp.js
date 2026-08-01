const fs = require('fs');
const file = 'src/modules/auth/services/ForgotPasswordService.ts';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/^import \* as crypto from 'crypto';\r?\n?/m, '');
content = content.replace(/^import { IAuditRepository }.*?\r?\n/m, "import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';\n");
content = content.replace(/^import { AuditEvent }.*?\r?\n/m, '');

content = content.replace(/private readonly auditRepository: IAuditRepository/g, 'private readonly eventDispatcher: IDomainEventDispatcher');

content = content.replace(/crypto\.randomUUID\(\)/g, 'this.randomGenerator.generateUUID()');
content = content.replace(/crypto\.createHash\('[^']+'\)\.update\(([^)]+)\)\.digest\('[^']+'\)/g, 'this.randomGenerator.hashString($1)');

const oldAudit = /const auditEvent = new AuditEvent\([\s\S]*?await this\.auditRepository\.save\(auditEvent\);/m;
content = content.replace(oldAudit, `for (const event of resetToken.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(resetToken.domainEvents);
    resetToken.clearEvents();`);

fs.writeFileSync(file, content, 'utf-8');
