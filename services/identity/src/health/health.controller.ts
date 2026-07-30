import { Request, Response } from 'express';

export class HealthController {
  public checkLiveness(_req: Request, res: Response): void {
    res.status(200).json({ status: 'UP' });
  }

  public checkReadiness(_req: Request, res: Response): void {
    res.status(200).json({ status: 'UP' });
  }
}
