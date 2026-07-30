import morgan from 'morgan';
import { Request } from 'express';
import { logger } from '../observability/logger';

export const morganMiddleware = morgan(
  (tokens, req: Request, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) || '0'),
      duration: Number.parseFloat(tokens['response-time'](req, res) || '0'),
      correlationId: req.correlationId,
    });
  },
  {
    stream: {
      write: (message: string) => {
        try {
          const data = JSON.parse(message);
          logger.http('Incoming request', data);
        } catch {
          logger.http(message.trim());
        }
      },
    },
  }
);
