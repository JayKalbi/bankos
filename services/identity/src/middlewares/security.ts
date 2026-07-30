import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config';

// Helmet Configuration (Restrictive API CSP)
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
});

// CORS Configuration
export const corsMiddleware = cors({
  origin: (requestOrigin, callback) => {
    // If no origin is provided (e.g., server-to-server) and we want to be strict, we could reject.
    // Usually APIs allow no origin or check against allowed list.
    if (!requestOrigin || config.corsAllowedOrigins.includes(requestOrigin) || config.corsAllowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
});

// HTTP Method Validation
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export const methodValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  next();
};

// Content Type Validation
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

export const contentTypeValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type']?.split(';')[0]?.trim();
    if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
      res.status(415).json({ error: 'Unsupported Media Type' });
      return;
    }
  }
  next();
};

// Header Sanitization
const HEADERS_TO_STRIP = [
  'x-user-id',
  'x-user-role',
  'x-user-roles',
  'x-authenticated-user',
  'x-forwarded-user',
  'x-internal-user',
];

export const headerSanitizationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  for (const header of HEADERS_TO_STRIP) {
    req.headers[header] = undefined;
  }
  next();
};
