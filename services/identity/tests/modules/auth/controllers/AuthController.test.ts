import { Request, Response } from 'express';
import { AuthController } from '../../../../src/modules/auth/controllers/AuthController';

describe('AuthController', () => {
  let authController: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  // Mock services
  const registerUserService = { execute: jest.fn() };
  const loginService = { execute: jest.fn() };
  const refreshTokenService = { execute: jest.fn() };
  const logoutService = { execute: jest.fn() };
  const forgotPasswordService = { execute: jest.fn() };
  const resetPasswordService = { execute: jest.fn() };
  const verifyEmailService = { execute: jest.fn() };
  const sendVerificationEmailService = { execute: jest.fn() };

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      body: {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest'
      }
    };

    res = {
      status: statusMock,
    };

    authController = new AuthController(
      registerUserService as any,
      loginService as any,
      refreshTokenService as any,
      logoutService as any,
      forgotPasswordService as any,
      resetPasswordService as any,
      verifyEmailService as any,
      sendVerificationEmailService as any
    );

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call register service', async () => {
      req.body.email = 'test@example.com';
      req.body.passwordRaw = 'Password123!';
      registerUserService.execute.mockResolvedValue({ id: 'user-id' });

      await authController.register(req as Request, res as Response);

      expect(registerUserService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { id: 'user-id' } });
    });
  });

  describe('login', () => {
    it('should call login service', async () => {
      req.body.email = 'test@example.com';
      req.body.passwordRaw = 'Password123!';
      loginService.execute.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

      await authController.login(req as Request, res as Response);

      expect(loginService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('refresh', () => {
    it('should call refresh service', async () => {
      req.body.refreshToken = 'valid-refresh-token';
      refreshTokenService.execute.mockResolvedValue({ accessToken: 'access-new', refreshToken: 'refresh-new' });

      await authController.refresh(req as Request, res as Response);

      expect(refreshTokenService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    it('should call logout service', async () => {
      req.body.refreshToken = 'valid-refresh-token';
      req.body.accessToken = 'access-token';

      await authController.logout(req as Request, res as Response);

      expect(logoutService.execute).toHaveBeenCalledWith(
        { accessToken: 'access-token', refreshToken: 'valid-refresh-token' },
        '127.0.0.1',
        'Jest'
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('forgot password', () => {
    it('should call forgot password service', async () => {
      req.body.email = 'test@example.com';
      await authController.forgotPassword(req as Request, res as Response);

      expect(forgotPasswordService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('reset password', () => {
    it('should call reset password service', async () => {
      req.body.token = 'valid-token';
      req.body.newPasswordRaw = 'NewPassword123!';
      await authController.resetPassword(req as Request, res as Response);

      expect(resetPasswordService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('verify email', () => {
    it('should call verify email service', async () => {
      req.body.token = 'valid-token';
      await authController.verifyEmail(req as Request, res as Response);

      expect(verifyEmailService.execute).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });
});
