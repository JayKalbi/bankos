const fs = require('fs');
const file = 'src/modules/auth/routes/auth.routes.ts';
let content = fs.readFileSync(file, 'utf-8');

// Add imports
if (!content.includes('DomainEventDispatcher')) {
  content = content.replace(
    /import { SecureRandomGenerator } from '\.\.\/\.\.\/\.\.\/infrastructure\/crypto\/SecureRandomGenerator';/,
    `import { SecureRandomGenerator } from '../../../infrastructure/crypto/SecureRandomGenerator';\nimport { DomainEventDispatcher } from '../../../infrastructure/events/DomainEventDispatcher';\nimport { AuditEventHandler } from '../../../infrastructure/events/handlers/AuditEventHandler';`
  );
}

// Add setup event dispatcher
if (!content.includes('eventDispatcher.register')) {
  content = content.replace(
    /\/\/ Instantiate Application Services/,
    `// Setup Event Dispatcher
const eventDispatcher = new DomainEventDispatcher();
const auditEventHandler = new AuditEventHandler(auditRepository, randomGenerator, clock);
eventDispatcher.register(auditEventHandler);

// Instantiate Application Services`
  );
}

// Replace auditRepository with eventDispatcher in service constructors
const replacements = [
  { search: 'registerUserService = new RegisterUserService(userRepository, roleRepository, passwordHasher, randomGenerator, emailVerificationRepo, auditRepository, clock)', replace: 'registerUserService = new RegisterUserService(userRepository, roleRepository, passwordHasher, randomGenerator, emailVerificationRepo, eventDispatcher, clock)' },
  { search: 'loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, auditRepository, clock)', replace: 'loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock)' },
  { search: 'refreshTokenService = new RefreshTokenService(userRepository, tokenService, deviceSessionRepository, auditRepository, clock)', replace: 'refreshTokenService = new RefreshTokenService(tokenService, deviceSessionRepository, userRepository, blacklistService, eventDispatcher, randomGenerator, clock)' },
  { search: 'logoutService = new LogoutService(tokenService, deviceSessionRepository, blacklistService, auditRepository, clock)', replace: 'logoutService = new LogoutService(tokenService, deviceSessionRepository, blacklistService, eventDispatcher, clock)' },
  { search: 'forgotPasswordService = new ForgotPasswordService(userRepository, passwordResetRepo, mailer, randomGenerator, clock, auditRepository)', replace: 'forgotPasswordService = new ForgotPasswordService(userRepository, passwordResetRepo, mailer, randomGenerator, clock, eventDispatcher)' },
  { search: 'resetPasswordService = new ResetPasswordService(userRepository, passwordResetRepo, passwordHasher, deviceSessionRepository, blacklistService, auditRepository, clock)', replace: 'resetPasswordService = new ResetPasswordService(userRepository, passwordResetRepo, passwordHasher, deviceSessionRepository, blacklistService, eventDispatcher, randomGenerator, clock)' },
  { search: 'verifyEmailService = new VerifyEmailService(userRepository, emailVerificationRepo, auditRepository, clock)', replace: 'verifyEmailService = new VerifyEmailService(userRepository, emailVerificationRepo, eventDispatcher, randomGenerator, clock)' },
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf-8');
