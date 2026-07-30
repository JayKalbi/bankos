import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

const UUIDV4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-correlation-id'];
  const extractedId = Array.isArray(existingId) ? existingId[0] : existingId;
  const correlationId = extractedId && UUIDV4_REGEX.test(extractedId) ? extractedId : uuidv4();

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
