import { otelSdk } from './observability/tracing';
otelSdk.start();

import { app } from './app';
import { config } from './config';
import { logger } from './observability/logger';

const server = app.listen(config.port, () => {
  logger.info(`[Identity Service] Server is starting...`);
  logger.info(`- Environment: ${config.env}`);
  logger.info(`- Port: ${config.port}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  // Safeguard timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      const { prisma } = await import('./infrastructure/database/client');
      await prisma.$disconnect();
      logger.info('Prisma disconnected successfully');
    } catch (err) {
      logger.error('Error disconnecting Prisma', { error: err });
    }

    otelSdk.shutdown().then(
      () => {
        logger.info('OpenTelemetry SDK shut down successfully');
        process.exit(0);
      },
      (err) => {
        logger.error('Error shutting down OpenTelemetry SDK', { error: err });
        process.exit(1);
      }
    );
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
