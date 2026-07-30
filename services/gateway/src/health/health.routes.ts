import { Router, Request, Response } from 'express';
import { getMetrics, getMetricsContentType } from '../observability/metrics';

const router = Router();

// Liveness probe (Kubernetes: is the process running?)
router.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Readiness probe (Kubernetes: is it ready to accept traffic?)
router.get('/health/ready', (_req: Request, res: Response) => {
  // For the skeleton, it's always ready. In future, this might check downstream connectivity or Redis cache.
  res.status(200).json({ status: 'READY' });
});

// Version endpoint (Deployment tracking)
router.get('/version', (_req: Request, res: Response) => {
  res.status(200).json({ version: '1.0.0-placeholder' });
});

// Build endpoint (Deployment tracking)
router.get('/build', (_req: Request, res: Response) => {
  res.status(200).json({ build: 'local-dev-placeholder' });
});

// Prometheus metrics endpoint
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', getMetricsContentType());
    res.end(await getMetrics());
  } catch {
    res.status(500).end('Error generating metrics');
  }
});

export default router;
