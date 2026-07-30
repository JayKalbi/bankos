import express, { Application } from 'express';
import { correlationIdMiddleware } from './middlewares/correlationId';
import { morganMiddleware } from './middlewares/morgan';
import { metricsMiddleware } from './observability/metrics';
import healthRoutes from './health/health.routes';
import {
  helmetMiddleware,
  corsMiddleware,
  sanitizeHeadersMiddleware,
  validateHttpMethodMiddleware,
  validateContentTypeMiddleware,
} from './middlewares/security';
import { rateLimitMiddleware } from './middlewares/rateLimit';
import { errorHandlerMiddleware, notFoundMiddleware } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';

const app: Application = express();

// --- Observability & Foundation Middlewares ---
app.use(correlationIdMiddleware);
app.use(metricsMiddleware);
app.use(morganMiddleware);

// --- Security Foundation Middlewares ---
// Secure HTTP headers
app.use(helmetMiddleware);

// Rate Limiting
app.use(rateLimitMiddleware);

// CORS configuration
app.use(corsMiddleware);

// HTTP Method Validation
app.use(validateHttpMethodMiddleware);

// Request Limits (1MB JSON, 1MB urlencoded)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Content-Type Validation for JSON/form data endpoints
app.use(validateContentTypeMiddleware);

// Header Sanitization (Strip identity headers from clients)
app.use(sanitizeHeadersMiddleware);

// --- Routes ---
// Health and Observability endpoints (e.g. /health/live, /metrics)
// These routes are unprotected
app.use('/', healthRoutes);

import proxyRouter from './routes/proxy';

// --- Authentication ---
// All routes registered below this point will require authentication
app.use(authMiddleware);

// --- Proxy Routing ---
// Forwards authenticated requests to internal microservices
app.use(proxyRouter);

// --- Error Handling ---
// 404 Handler for unmatched routes
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorHandlerMiddleware);

export default app;
