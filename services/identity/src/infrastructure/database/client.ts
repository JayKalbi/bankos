import { PrismaClient } from '@prisma/client';
import { logger } from '../../observability/logger';
import { config } from '../../config';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn('Prisma warning', { message: e.message });
});

prisma.$on('error', (e: { message: string }) => {
  logger.error('Prisma error', { message: e.message });
});
