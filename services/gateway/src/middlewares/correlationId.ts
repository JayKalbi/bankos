import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-correlation-id'];
  const correlationId = Array.isArray(existingId) ? existingId[0] : existingId || uuidv4();

  // Attach to request for downstream middlewares and logging
  req.correlationId = correlationId;

  // Always return it in the response
  res.setHeader('x-correlation-id', correlationId);

  // Set it in AsyncLocalStorage for logger injection
  const store = new Map<string, string>();
  store.set('correlationId', correlationId);

  asyncLocalStorage.run(store, () => {
    next();
  });
};
