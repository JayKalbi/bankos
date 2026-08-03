const fs = require('fs');

function fixFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

// 1. AuthController.ts - line 46
fixFile('src/modules/auth/controllers/AuthController.ts', c =>
  c.replace('this.refreshTokenService.execute(req.body)', 'this.refreshTokenService.execute(req.body.refreshToken, req.body.ipAddress, req.body.userAgent)')
);

// 2. RefreshTokenService.ts - line 25 unused 'error'
fixFile('src/modules/auth/services/RefreshTokenService.ts', c =>
  c.replace('} catch (error) {', '} catch (_) {')
);

// 3. LoginService.ts - regex escapes
fixFile('src/modules/auth/services/LoginService.ts', c =>
  c.replace(/\\\=/g, '=').replace(/\\\+/g, '+')
);

// 4. rbac.routes.ts - unused imports
fixFile('src/modules/auth/routes/rbac.routes.ts', c => {
  let s = c;
  s = s.replace(/import \{ requirePermission \} from '\.\.\/middleware\/requireAuth';\n/, '');
  s = s.replace(/import \{ JwtTokenService \} from '\.\.\/\.\.\/\.\.\/infrastructure\/crypto\/JwtTokenService';\n/, '');
  return s;
});

// 5. PrismaRoleRepository.ts and PrismaUserRepository.ts unused 'e'
fixFile('src/modules/auth/repositories/PrismaRoleRepository.ts', c => c.replace(/} catch \(e\) {/g, '} catch (_) {'));
fixFile('src/modules/auth/repositories/PrismaUserRepository.ts', c => c.replace(/} catch \(e\) {/g, '} catch (_) {'));

// 6. requireAuth.ts unused imports and vars
fixFile('src/modules/auth/middleware/requireAuth.ts', c => {
  let s = c;
  s = s.replace(/import \{ extractAuthToken \} from '\.\.\/\.\.\/\.\.\/middlewares\/extractAuthToken';\n/, '');
  s = s.replace(/\} catch \(err\) \{/g, '} catch (_) {');
  s = s.replace(/\} catch \(_\) \{/g, '} catch (_) {'); // idempotency
  return s;
});

// 7. PolicyEngine & RBACEvaluator extraneous class
fixFile('src/modules/auth/engine/PolicyEngine.ts', c =>
  c.replace('export class PolicyEngine', '// eslint-disable-next-line @typescript-eslint/no-extraneous-class\nexport class PolicyEngine')
);
fixFile('src/modules/auth/engine/RBACEvaluator.ts', c =>
  c.replace('export class RBACEvaluator', '// eslint-disable-next-line @typescript-eslint/no-extraneous-class\nexport class RBACEvaluator')
);
fixFile('src/modules/auth/validators/RbacValidators.ts', c =>
  c.replace('export class RbacValidators', '// eslint-disable-next-line @typescript-eslint/no-extraneous-class\nexport class RbacValidators')
);

// 8. AuthorizationEngine.ts - unused PolicyEngine
fixFile('src/modules/auth/engine/AuthorizationEngine.ts', c =>
  c.replace(/import \{ PolicyEngine \} from '\.\/PolicyEngine';\n/, '')
);

// 9. mapper.ts - unused UserRole
fixFile('src/infrastructure/database/mapper.ts', c =>
  c.replace(/UserRole, /g, '')
);

// 10. Role.ts - boolean inference
fixFile('src/core/domain/Role.ts', c =>
  c.replace('systemRole: boolean = false', 'systemRole = false')
);

// 11. PermissionResolver.ts - any type
fixFile('src/modules/auth/engine/PermissionResolver.ts', c =>
  c.replace('permissions.map((p: any)', 'permissions.map((p: unknown')
);
