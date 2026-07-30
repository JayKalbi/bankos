import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();
const UUIDV4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const existingId = req.headers['x-correlation-id'];
  const extractedId = Array.isArray(existingId) ? existingId[0] : existingId;
  const correlationId = extractedId && UUIDV4_REGEX.test(extractedId) ? extractedId : crypto.randomUUID();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const store = new Map<string, string>();
  store.set('correlationId', correlationId);

  asyncLocalStorage.run(store, () => {
    next();
  });
};
