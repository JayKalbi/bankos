import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AuthResponseMapper } from '../modules/auth/mappers/AuthResponseMapper';

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(AuthResponseMapper.toError('VALIDATION_ERROR', 'Invalid request payload'));
        return;
      }
      next(error);
    }
  };
};
