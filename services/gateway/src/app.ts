import express, { Application } from 'express';
import { correlationIdMiddleware } from './middlewares/correlationId';
import { morganMiddleware } from './middlewares/morgan';
import { metricsMiddleware } from './observability/metrics';
import healthRoutes from './health/health.routes';

const app: Application = express();

// --- Observability & Foundation Middlewares ---
// Inject correlation ID early in the pipeline
app.use(correlationIdMiddleware);

// Record HTTP metrics
app.use(metricsMiddleware);

// HTTP Access Logging
app.use(morganMiddleware);

// --- Routes ---
// Health and Observability endpoints (e.g. /health/live, /metrics)
app.use('/', healthRoutes);

// Placeholder for middlewares (Helmet, CORS, Rate Limiting)
// Placeholder for authentication middleware
// Placeholder for proxy routes (Identity, Customer360, Credit Risk)
// Placeholder for global error handler

export default app;
