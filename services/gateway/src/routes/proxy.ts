import { Router, Request, Response } from 'express';
import { createProxyMiddleware, Options, fixRequestBody } from 'http-proxy-middleware';
import { config } from '../config';
import { logger } from '../observability/logger';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

const router = Router();

// Reusable Proxy Configuration Factory
const createServiceProxy = (target: string): ReturnType<typeof createProxyMiddleware> => {
  const options: Options = {
    target,
    changeOrigin: true, // required for virtual hosted sites
    timeout: config.PROXY_TIMEOUT_MS,
    proxyTimeout: config.PROXY_TIMEOUT_MS,

    on: {
      proxyReq: (proxyReq: ClientRequest, req: IncomingMessage, _res: ServerResponse) => {
        const expressReq = req as Request;
        // Remove hop-by-hop headers
        proxyReq.removeHeader('Connection');
        proxyReq.removeHeader('Keep-Alive');

        // Ensure trusted authenticated headers are correctly propagated
        if (expressReq.correlationId) {
          proxyReq.setHeader('x-correlation-id', expressReq.correlationId);
        }

        // Use builtin fixRequestBody to handle bodies consumed by express.json/urlencoded
        if (expressReq.body) {
          fixRequestBody(proxyReq, req);
        }
      },
      error: (err: Error, req: Request, res: Response) => {
        const nodeErr = err as NodeJS.ErrnoException;
        logger.error('Proxy Error', {
          error: nodeErr.message,
          code: nodeErr.code,
          target,
          url: req.url,
        });

        if (!res.headersSent) {
          // Standard JSON response for proxy errors (do not leak stack traces)
          let statusCode = 502; // Bad Gateway
          if (nodeErr.code === 'ECONNREFUSED') {
            statusCode = 503; // Service Unavailable
          } else if (nodeErr.code === 'ETIMEDOUT') {
            statusCode = 504; // Gateway Timeout
          }

          res.status(statusCode).json({
            error: 'Gateway Error',
            message: 'Downstream service is currently unavailable.',
          });
        }
      },
    },
  };
  return createProxyMiddleware(options);
};

// Route Definitions Configuration
// /api/v1/auth -> Identity Service
// /api/v1/customers -> Customer360 Service
// /api/v1/risk -> Credit Risk Service

router.use('/api/v1/auth', createServiceProxy(config.IDENTITY_SERVICE_URL));
router.use('/api/v1/customers', createServiceProxy(config.CUSTOMER360_SERVICE_URL));
router.use('/api/v1/risk', createServiceProxy(config.CREDIT_RISK_SERVICE_URL));

export default router;
