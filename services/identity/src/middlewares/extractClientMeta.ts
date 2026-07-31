import { Request, Response, NextFunction } from 'express';

export const extractClientMeta = (req: Request, _res: Response, next: NextFunction): void => {
  req.body.ipAddress = req.ip || 'unknown';
  req.body.userAgent = req.headers['user-agent'] || 'unknown';
  next();
};
