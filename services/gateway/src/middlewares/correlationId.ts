import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-correlation-id'];
  const correlationId = Array.isArray(existingId) ? existingId[0] : existingId || uuidv4();

  // Attach to request for downstream middlewares and logging
  req.correlationId = correlationId;

  // Always return it in the response
  res.setHeader('x-correlation-id', correlationId);

  next();
};
