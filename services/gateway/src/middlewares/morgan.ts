import morgan from 'morgan';
import { logger } from '../observability/logger';
import { Request } from 'express';

// Define a custom morgan token for the correlation ID
morgan.token('correlationId', (req: Request) => req.correlationId || 'unknown');

// Configure morgan to pipe HTTP access logs into Winston
export const morganMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [CorrelationId: :correlationId]',
  {
    stream: {
      write: (message: string) => {
        // Log at 'http' level and strip the trailing newline added by morgan
        logger.http(message.trim());
      },
    },
  },
);
