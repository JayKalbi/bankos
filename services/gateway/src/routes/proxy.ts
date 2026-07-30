import { Router, Request, Response } from 'express';
import { createProxyMiddleware, Options, fixRequestBody } from 'http-proxy-middleware';
import { config } from '../config';
import { logger } from '../observability/logger';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

import { createResilientProxy } from '../middlewares/resilience';

const router = Router();

// Reusable Proxy Configuration Factory
const createServiceProxy = (name: string, target: string) => {
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
      error: (err: Error, req: IncomingMessage, res: unknown) => {
        const nodeErr = err as NodeJS.ErrnoException;
        const expressReq = req as Request;
        const expressRes = res as Response;

        logger.error('Proxy Error', {
          error: nodeErr.message,
          code: nodeErr.code,
          target,
          url: expressReq.url,
        });

        if (expressRes.locals.proxyReject) {
          return expressRes.locals.proxyReject(nodeErr);
        }

        if (!expressRes.headersSent) {
          // Standard JSON response for proxy errors (do not leak stack traces)
          let statusCode = 502; // Bad Gateway
          if (nodeErr.code === 'ECONNREFUSED') {
            statusCode = 503; // Service Unavailable
          } else if (nodeErr.code === 'ETIMEDOUT') {
            statusCode = 504; // Gateway Timeout
          }

          expressRes.status(statusCode).json({
            error: 'Gateway Error',
            message: 'Downstream service is currently unavailable.',
          });
        }
      },
    },
  };

  const proxyMiddleware = createProxyMiddleware(options);
  return createResilientProxy({ name, proxyMiddleware });
};

// Route Definitions Configuration
// /api/v1/auth -> Identity Service
// /api/v1/customers -> Customer360 Service
// /api/v1/risk -> Credit Risk Service

router.use('/api/v1/auth', createServiceProxy('identity', config.IDENTITY_SERVICE_URL));
router.use('/api/v1/customers', createServiceProxy('customer360', config.CUSTOMER360_SERVICE_URL));
router.use('/api/v1/risk', createServiceProxy('credit_risk', config.CREDIT_RISK_SERVICE_URL));

export default router;
