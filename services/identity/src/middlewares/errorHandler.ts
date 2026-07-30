import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger';

interface StandardErrorResponse {
  error: {
    message: string;
    code?: string;
  };
  correlationId?: string;
}

export const errorHandlerMiddleware = (
  err: Error & { type?: string; status?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // CORS Error
  if (err.message === 'Not allowed by CORS') {
    logger.warn('CORS validation failed', { origin: req.headers.origin });
    res.status(403).json({
      error: { message: 'Forbidden: CORS origin not allowed' },
      correlationId: req.correlationId,
    } as StandardErrorResponse);
    return;
  }

  // Payload Too Large (Express body-parser emits 'entity.too.large' with status 413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    logger.warn('Payload too large', { length: req.headers['content-length'] });
    res.status(413).json({
      error: { message: 'Payload Too Large' },
      correlationId: req.correlationId,
    } as StandardErrorResponse);
    return;
  }

  // Malformed JSON (Express body-parser emits 'entity.parse.failed' with status 400)
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    logger.warn('Malformed request payload', { error: err.message });
    res.status(400).json({
      error: { message: 'Bad Request: Malformed payload' },
      correlationId: req.correlationId,
    } as StandardErrorResponse);
    return;
  }

  // Default fallback for unhandled errors
  logger.error('Unhandled server error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: { message: 'Internal Server Error' },
    correlationId: req.correlationId,
  } as StandardErrorResponse);
};
