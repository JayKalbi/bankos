import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as promClient from 'prom-client';
import winston from 'winston';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 8080;
const IDENTITY_URL = process.env.IDENTITY_URL || 'http://identity-service:8080';
const CUSTOMER_URL = process.env.CUSTOMER_URL || 'http://customer360-service:8080';
const RISK_URL = process.env.RISK_URL || 'http://credit-risk-service:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Prometheus Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'api-gateway', version: '1.0.0', environment: process.env.NODE_ENV || 'local' },
  transports: [new winston.transports.Console()]
});

app.use(helmet());
app.use(cors());

// Observability Middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
  logger.info('Incoming request', { method: req.method, path: req.path, requestId: req.headers['x-request-id'] });
  next();
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);

// Health Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'READY' }));
app.get('/live', (req, res) => res.status(200).json({ status: 'ALIVE' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Auth Middleware
const verifyJwt = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.locals.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Token verification failed' });
  }
};

// Routing
app.use('/api/v1/auth', createProxyMiddleware({ target: IDENTITY_URL, changeOrigin: true }));
app.use('/api/v1/customers', verifyJwt, createProxyMiddleware({ target: CUSTOMER_URL, changeOrigin: true }));
app.use('/api/v1/risk', verifyJwt, createProxyMiddleware({ target: RISK_URL, changeOrigin: true }));

app.listen(port, () => {
  logger.info(Gateway listening on port );
});
