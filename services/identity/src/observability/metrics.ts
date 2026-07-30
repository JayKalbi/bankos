import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Enable default metrics collection
client.collectDefaultMetrics({ prefix: 'identity_service_' });

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode,
    });
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode,
    });
  });
  next();
};

export const getMetrics = async (): Promise<string> => {
  return await client.register.metrics();
};
