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
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
