import { Request, Response, NextFunction } from 'express';
import { PolicyEngine } from '../engine/PolicyEngine';
import { DomainEventDispatcher } from '../../../infrastructure/events/DomainEventDispatcher';
import { AuthorizationDenied } from '../../../core/events/AuthorizationDenied';
import { JwtTokenService } from '../../../infrastructure/crypto/JwtTokenService';

export const requireRole = (requiredRole: string, tokenService: JwtTokenService, dispatcher: DomainEventDispatcher) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.body.token || req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = tokenService.verifyAccessToken<{ sub: string; roles: string[]; permissions: string[] }>(token);

      if (!PolicyEngine.requireRole(payload.roles || [], requiredRole)) {
        await dispatcher.dispatch([new AuthorizationDenied(payload.sub, 'Insufficient role or permissions')]);
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as unknown as { user: unknown }).user = payload;
      next();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export const requirePermission = (requiredPermission: string, tokenService: JwtTokenService, dispatcher: DomainEventDispatcher) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = tokenService.verifyAccessToken<{ sub: string; roles: string[]; permissions: string[] }>(token);

      if (!PolicyEngine.requirePermission(payload.permissions || [], requiredPermission)) {
        await dispatcher.dispatch([new AuthorizationDenied(payload.sub, 'Insufficient role or permissions')]);
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as unknown as { user: unknown }).user = payload;
      next();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export const requireAnyPermission = (requiredPermissions: string[], tokenService: JwtTokenService, dispatcher: DomainEventDispatcher) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = tokenService.verifyAccessToken<{ sub: string; roles: string[]; permissions: string[] }>(token);

      if (!PolicyEngine.requireAny(payload.permissions || [], requiredPermissions)) {
        await dispatcher.dispatch([new AuthorizationDenied(payload.sub, req.path, JSON.stringify({ requiredAny: requiredPermissions, actual: payload.permissions }))]);
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as unknown as { user: unknown }).user = payload;
      next();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export const requireAllPermissions = (requiredPermissions: string[], tokenService: JwtTokenService, dispatcher: DomainEventDispatcher) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = tokenService.verifyAccessToken<{ sub: string; roles: string[]; permissions: string[] }>(token);

      if (!PolicyEngine.requireAll(payload.permissions || [], requiredPermissions)) {
        await dispatcher.dispatch([new AuthorizationDenied(payload.sub, req.path, JSON.stringify({ requiredAll: requiredPermissions, actual: payload.permissions }))]);
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as unknown as { user: unknown }).user = payload;
      next();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
