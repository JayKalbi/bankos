import { prisma } from './client';
import { logger } from '../../observability/logger';

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: unknown) {
    logger.error('Database health check failed', { error });
    return false;
  }
};
