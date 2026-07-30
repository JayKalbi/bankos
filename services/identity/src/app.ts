import express, { Application, Request, Response, NextFunction } from 'express';
import { HealthController } from './health/health.controller';
import { correlationIdMiddleware } from './middlewares/correlationId';
import { morganMiddleware } from './middlewares/morgan';
import { metricsMiddleware, getMetrics } from './observability/metrics';
import { logger } from './observability/logger';

const app: Application = express();

app.use(correlationIdMiddleware);
app.use(morganMiddleware);
app.use(metricsMiddleware);
app.use(express.json());

// Routes
const healthController = new HealthController();

app.get('/health/live', (req: Request, res: Response) => {
  healthController.checkLiveness(req, res);
});

app.get('/health/ready', (req: Request, res: Response) => {
  healthController.checkReadiness(req, res);
});

app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(await getMetrics());
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

export { app };
