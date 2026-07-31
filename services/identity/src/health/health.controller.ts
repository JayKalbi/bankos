import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../infrastructure/database/health';
import { checkRedisHealth } from '../infrastructure/redis/health';

export class HealthController {
  public checkLiveness(_req: Request, res: Response): void {
    res.status(200).json({ status: 'UP' });
  }

  public async checkReadiness(_req: Request, res: Response): Promise<void> {
    const [isDbHealthy, isRedisHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth()
    ]);

    if (isDbHealthy && isRedisHealthy) {
      res.status(200).json({ status: 'UP' });
    } else {
      res.status(503).json({
        status: 'DOWN',
        error: 'Dependencies unavailable',
        details: {
          database: isDbHealthy ? 'UP' : 'DOWN',
          redis: isRedisHealthy ? 'UP' : 'DOWN'
        }
      });
    }
  }
}
