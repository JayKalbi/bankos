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

export const rolesCreatedTotal = new client.Counter({
  name: 'roles_created_total',
  help: 'Total number of roles created'
});

export const permissionsCreatedTotal = new client.Counter({
  name: 'permissions_created_total',
  help: 'Total number of permissions created'
});

export const roleAssignmentsTotal = new client.Counter({
  name: 'role_assignments_total',
  help: 'Total number of role assignments'
});

export const permissionChecksTotal = new client.Counter({
  name: 'permission_checks_total',
  help: 'Total number of permission checks'
});

export const permissionDeniedTotal = new client.Counter({
  name: 'permission_denied_total',
  help: 'Total number of permission denied events'
});

export const authorizationLatencySeconds = new client.Histogram({
  name: 'authorization_latency_seconds',
  help: 'Latency of authorization evaluations in seconds',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});
