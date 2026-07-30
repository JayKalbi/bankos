import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Enable default metrics collection (e.g. CPU, memory usage)
client.collectDefaultMetrics({
  prefix: 'gateway_',
});

// Counter for all HTTP requests
export const httpRequestCounter = new client.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total number of HTTP requests processed by the API Gateway',
  labelNames: ['method', 'route', 'status_code'],
});

// Histogram for request duration
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // Buckets for response time from 100ms to 10s
});

// Circuit Breaker Metrics
export const cbStateGauge = new client.Gauge({
  name: 'gateway_circuit_breaker_state',
  help: 'State of the circuit breaker (0 = closed/healthy, 1 = open/unhealthy)',
  labelNames: ['target'],
});

export const cbEventsCounter = new client.Counter({
  name: 'gateway_circuit_breaker_events_total',
  help: 'Total events emitted by circuit breakers',
  labelNames: ['target', 'event_type'], // event_type: 'timeout', 'failure', 'retry', 'reject'
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDurationMicroseconds.startTimer();

  res.on('finish', () => {
    // Only log base path to avoid cardinality explosion from path parameters
    const route = req.route ? req.route.path : req.path;

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    end({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });

  next();
};

export const getMetrics = async (): Promise<string> => {
  return await client.register.metrics();
};

export const getMetricsContentType = (): string => {
  return client.register.contentType;
};
