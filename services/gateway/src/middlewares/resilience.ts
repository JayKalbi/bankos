import CircuitBreaker from 'opossum';
import { Request, Response, RequestHandler } from 'express';
import { config } from '../config';
import { logger } from '../observability/logger';
import { cbEventsCounter, cbStateGauge } from '../observability/metrics';

interface ProxyResilienceOptions {
  name: string;
  proxyMiddleware: RequestHandler;
}

export const createResilientProxy = ({
  name,
  proxyMiddleware,
}: ProxyResilienceOptions): RequestHandler => {
  // 1. Define the core proxy execution as a Promise
  const executeProxy = (req: Request, res: Response): Promise<void> => {
    return new Promise((resolve, reject) => {
      // In http-proxy-middleware, we intercept errors in onProxyError and call res.locals.proxyReject
      res.locals.proxyReject = reject;
      res.locals.proxyResolve = resolve;

      // Resolve when response finishes successfully
      res.once('finish', () => resolve());

      proxyMiddleware(req, res, (err?: unknown) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  // 2. Wrap with Opossum Circuit Breaker & Bulkhead
  const breaker = new CircuitBreaker(executeProxy, {
    name,
    timeout: config.PROXY_TIMEOUT_MS, // Timeout per individual request
    errorThresholdPercentage: config.CB_ERROR_THRESHOLD_PERCENT,
    resetTimeout: config.CB_RESET_TIMEOUT_MS,
    capacity: config.CB_MAX_CONCURRENT_REQUESTS, // Bulkhead isolation
  });

  // 3. Wrap with Retry Logic (Only for Idempotent Methods)
  const IDEMPOTENT_METHODS = ['GET', 'HEAD', 'OPTIONS'];

  const executeWithRetry = async (req: Request, res: Response): Promise<void> => {
    const maxRetries = IDEMPOTENT_METHODS.includes(req.method) ? config.RETRY_COUNT : 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await breaker.fire(req, res);
        return; // Success
      } catch (err: unknown) {
        const error = err as { type?: string; code?: string; message?: string };
        // Do not retry if the circuit breaker is already open or bulkhead exhausted
        if (
          error.type === 'open' ||
          error.type === 'system-overload' ||
          (error.message && error.message.includes('Bulkhead'))
        ) {
          throw err;
        }

        if (attempt >= maxRetries) {
          throw err; // Max retries exceeded
        }

        // If headers are already sent, we cannot safely retry
        if (res.headersSent) {
          throw err;
        }

        cbEventsCounter.labels(name, 'retry').inc();

        const delay = config.RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
        logger.warn(`Retrying request to ${name}`, {
          attempt: attempt + 1,
          maxRetries,
          delay,
          method: req.method,
          url: req.url,
        });

        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  // 4. Bind Prometheus Metrics
  breaker.on('open', () => {
    logger.error(`Circuit Breaker OPENED for ${name}`);
    cbStateGauge.labels(name).set(1);
  });
  breaker.on('close', () => {
    logger.info(`Circuit Breaker CLOSED for ${name}`);
    cbStateGauge.labels(name).set(0);
  });
  breaker.on('halfOpen', () => {
    logger.info(`Circuit Breaker HALF-OPEN for ${name}`);
  });
  breaker.on('timeout', () => cbEventsCounter.labels(name, 'timeout').inc());
  breaker.on('reject', () => cbEventsCounter.labels(name, 'reject').inc()); // Bulkhead/CB reject
  breaker.on('failure', () => cbEventsCounter.labels(name, 'failure').inc());

  // 5. Express Middleware Wrapper
  return async (req: Request, res: Response, _next: import('express').NextFunction) => {
    try {
      await executeWithRetry(req, res);
    } catch (error: unknown) {
      const err = error as { type?: string; code?: string; message?: string };
      // Graceful Degradation Response
      if (!res.headersSent) {
        if (err.type === 'open') {
          res.status(503).json({
            error: 'Service Unavailable',
            message: `Circuit breaker is open for ${name}. Downstream is unavailable.`,
          });
        } else if (err.code === 'ECONNREFUSED') {
          res.status(503).json({
            error: 'Service Unavailable',
            message: `Downstream service ${name} refused connection.`,
          });
        } else if (err.code === 'ETIMEDOUT' || err.type === 'timeout') {
          res.status(504).json({
            error: 'Gateway Timeout',
            message: `Request to ${name} timed out.`,
          });
        } else if (
          err.type === 'system-overload' ||
          (err.message && err.message.includes('Bulkhead'))
        ) {
          res.status(429).json({
            error: 'Too Many Requests',
            message: `Bulkhead exhausted for ${name}. Try again later.`,
          });
        } else {
          // Standard JSON response for other proxy errors
          res.status(502).json({
            error: 'Bad Gateway',
            message: `Unexpected error communicating with ${name}.`,
          });
        }
      }
    }
  };
};
