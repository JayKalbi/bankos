import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger';

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error('Unhandled Exception caught in Gateway', {
    message: err.message,
    stack: err.stack,
  });

  // Handle oversized payloads gracefully (from express.json / express.urlencoded)
  if (err.message && err.message.includes('request entity too large')) {
    res.status(413).json({
      error: 'Payload Too Large',
      message: 'The request body exceeds the allowed size limit of 1MB.',
    });
    return;
  }

  if (err.message && err.message.includes('Not allowed by CORS')) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Cross-Origin Request Blocked by CORS Policy',
    });
    return;
  }

  // Consistent JSON response, hiding implementation details
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
};

// 404 Handler for unmatched routes
export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.method} ${req.url} was not found on the Gateway.`,
  });
};
