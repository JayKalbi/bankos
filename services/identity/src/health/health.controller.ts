import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../infrastructure/database/health';

export class HealthController {
  public checkLiveness(_req: Request, res: Response): void {
    res.status(200).json({ status: 'UP' });
  }

  public async checkReadiness(_req: Request, res: Response): Promise<void> {
    const isDbHealthy = await checkDatabaseHealth();
    if (isDbHealthy) {
      res.status(200).json({ status: 'UP' });
    } else {
      res.status(503).json({ status: 'DOWN', error: 'Database unavailable' });
    }
  }
}
