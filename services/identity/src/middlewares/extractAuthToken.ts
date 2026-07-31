import { Request, Response, NextFunction } from 'express';
import { AuthResponseMapper } from '../modules/auth/mappers/AuthResponseMapper';

export const extractAuthToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(AuthResponseMapper.toError('UNAUTHORIZED', 'Missing or invalid token'));
    return;
  }

  const accessToken = authHeader.split(' ')[1];
  req.body.accessToken = accessToken;
  next();
};
