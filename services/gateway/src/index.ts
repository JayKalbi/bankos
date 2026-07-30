import { initTracing } from './observability/tracing';
// Initialize OpenTelemetry before importing other modules
const otelSdk = initTracing();

import app from './app';
import * as http from 'http';
import { config } from './config';
import { logger } from './observability/logger';

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`API Gateway is starting in ${config.NODE_ENV} mode...`);
  logger.info(`Listening on port ${config.PORT}`);
});

// Graceful shutdown handling
const shutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');

  // Close idle connections to prevent keep-alive hangs
  if (server.closeIdleConnections) {
    server.closeIdleConnections();
  }

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await otelSdk.shutdown();
      logger.info('OpenTelemetry SDK shut down.');
      process.exit(0);
    } catch (error) {
      logger.error('Error shutting down OpenTelemetry SDK', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
