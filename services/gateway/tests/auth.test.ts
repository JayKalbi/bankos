import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../src/middlewares/auth';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  const generateToken = (payload: any, options?: jwt.SignOptions, secret = config.JWT_SECRET) => {
    return jwt.sign(payload, secret, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
      ...options,
    });
  };

  it('should return 401 if Authorization header is missing', async () => {
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing Authorization header.' })
    );
  });

  it('should return 401 if Authorization header is malformed', async () => {
    mockRequest.headers = { authorization: 'Basic dGVzdDp0ZXN0' };
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Malformed Authorization header. Expected Bearer token format.' })
    );
  });

  it('should return 401 for an invalid signature', async () => {
    const token = generateToken({ sub: 'user-123' }, {}, 'wrong-secret');
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token signature or payload.' })
    );
  });

  it('should return 401 if token is expired', async () => {
    const token = generateToken({ sub: 'user-123' }, { expiresIn: '-1h' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token has expired.' })
    );
  });

  it('should return 401 for wrong issuer', async () => {
    const token = generateToken({ sub: 'user-123' }, { issuer: 'wrong-issuer' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token signature or payload.' })
    );
  });

  it('should return 401 for wrong audience', async () => {
    const token = generateToken({ sub: 'user-123' }, { audience: 'wrong-audience' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token signature or payload.' })
    );
  });

  it('should authenticate successfully and inject trusted headers', async () => {
    const token = generateToken({ sub: 'user-123', roles: ['admin', 'user'] });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.headers['x-user-id']).toBe('user-123');
    expect(mockRequest.headers['x-user-roles']).toBe('admin,user');
    expect(mockRequest.headers['x-authenticated-user']).toBe('true');
  });
});
