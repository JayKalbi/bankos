import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// 1. Helmet: Secure HTTP headers
// Helmet defaults are secure; we ensure cross-origin/proxy readiness.
export const helmetMiddleware = helmet({
  contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
});

// 2. CORS: Restrict allowed origins
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.CORS_ALLOWED_ORIGINS;
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
});

// 3. Header Sanitization: Never trust downstream identity headers
const DISALLOWED_HEADERS = [
  'x-user-id',
  'x-user-role',
  'x-user-email',
  'x-user-roles',
  'x-authenticated-user',
  'x-forwarded-user',
];

export const sanitizeHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  for (const header of DISALLOWED_HEADERS) {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  }
  next();
};

// 4. HTTP Method Validation: Reject unsupported methods
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export const validateHttpMethodMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!SUPPORTED_METHODS.includes(req.method)) {
    res.status(405).json({
      error: 'Method Not Allowed',
      message: `HTTP method ${req.method} is not supported.`,
    });
    return;
  }
  next();
};

// 5. Content-Type Validation: Reject malformed content types
export const validateContentTypeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only validate methods that typically have bodies
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (
      !contentType ||
      (!contentType.includes('application/json') &&
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('multipart/form-data'))
    ) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message:
          'Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data.',
      });
      return;
    }
  }
  next();
};
