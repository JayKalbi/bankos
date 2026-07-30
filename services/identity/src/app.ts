import express, { Application, Request, Response, NextFunction } from 'express';
import { HealthController } from './health/health.controller';
import { correlationIdMiddleware } from './middlewares/correlationId';
import { morganMiddleware } from './middlewares/morgan';
import { metricsMiddleware, getMetrics } from './observability/metrics';
import {
  helmetMiddleware,
  corsMiddleware,
  methodValidationMiddleware,
  contentTypeValidationMiddleware,
  headerSanitizationMiddleware,
} from './middlewares/security';
import { errorHandlerMiddleware } from './middlewares/errorHandler';

const app: Application = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(methodValidationMiddleware);
app.use(correlationIdMiddleware);
app.use(headerSanitizationMiddleware);
app.use(morganMiddleware);
app.use(metricsMiddleware);
app.use(contentTypeValidationMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Routes
const healthController = new HealthController();

app.get('/health/live', (req: Request, res: Response) => {
  healthController.checkLiveness(req, res);
});

app.get('/health/ready', (req: Request, res: Response, next: NextFunction) => {
  healthController.checkReadiness(req, res).catch(next);
});

app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(await getMetrics());
});

// Error handling middleware
app.use(errorHandlerMiddleware);

export { app };
