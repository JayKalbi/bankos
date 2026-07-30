import express, { Application, Request, Response, NextFunction } from 'express';
import { HealthController } from './health/health.controller';

const app: Application = express();

app.use(express.json());

// Routes
const healthController = new HealthController();

app.get('/health/live', (req: Request, res: Response) => {
  healthController.checkLiveness(req, res);
});

app.get('/health/ready', (req: Request, res: Response) => {
  healthController.checkReadiness(req, res);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export { app };
