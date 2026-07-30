import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config';

// Structure for future JWKS support. Currently wrapping synchronous jsonwebtoken verify.
const verifyToken = async (token: string): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.JWT_SECRET,
      {
        algorithms: ['HS256'], // Strict algorithm checking
        issuer: config.JWT_ISSUER,
        audience: config.JWT_AUDIENCE,
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as jwt.JwtPayload);
        }
      },
    );
  });
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing Authorization header.',
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Malformed Authorization header. Expected Bearer token format.',
      });
      return;
    }

    const token = parts[1];

    // Validate token
    const decoded = await verifyToken(token);

    // Extract trusted claims
    const userId = typeof decoded.sub === 'string' ? decoded.sub : decoded.userId;
    const roles = decoded.roles || [];

    // Future enhancement: Policy evaluation for global 403 Forbidden scenarios goes here.

    // Inject trusted headers for downstream services.
    // This forcibly overrides any client-supplied headers (which were stripped by security.ts anyway)
    if (userId) req.headers['x-user-id'] = String(userId);
    if (roles && Array.isArray(roles)) req.headers['x-user-roles'] = roles.join(',');
    req.headers['x-authenticated-user'] = 'true';

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired.',
      });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token signature or payload.',
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred during authentication.',
      });
    }
  }
};
