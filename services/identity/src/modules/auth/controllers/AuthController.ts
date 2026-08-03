import { Request, Response } from 'express';
import { AuthResponseMapper } from '../mappers/AuthResponseMapper';
import { RegisterUserService } from '../services/RegisterUserService';
import { LoginService } from '../services/LoginService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { LogoutService } from '../services/LogoutService';
import { ForgotPasswordService } from '../services/ForgotPasswordService';
import { ResetPasswordService } from '../services/ResetPasswordService';
import { VerifyEmailService } from '../services/VerifyEmailService';
import { SendVerificationEmailService } from '../services/SendVerificationEmailService';
import { DomainError } from '../../../core/errors/DomainError';
import { InvalidStateError } from '../../../core/errors/InvalidStateError';

export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginService: LoginService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutService: LogoutService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly verifyEmailService: VerifyEmailService,
    private readonly sendVerificationEmailService: SendVerificationEmailService
  ) {}

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.registerUserService.execute(req.body);
      res.status(201).json(AuthResponseMapper.toSuccess(response));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.loginService.execute(req.body);
      res.status(200).json(AuthResponseMapper.toSuccess(response));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async refresh(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.refreshTokenService.execute(req.body.refreshToken, req.body.ipAddress, req.body.userAgent);
      res.status(200).json(AuthResponseMapper.toSuccess(response));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      await this.logoutService.execute(
        { accessToken: req.body.accessToken, refreshToken: req.body.refreshToken },
        req.body.ipAddress,
        req.body.userAgent
      );
      res.status(200).json(AuthResponseMapper.toSuccess());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      await this.forgotPasswordService.execute(req.body);
      res.status(200).json(AuthResponseMapper.toSuccess());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      await this.resetPasswordService.execute(req.body);
      res.status(200).json(AuthResponseMapper.toSuccess());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      await this.verifyEmailService.execute(req.body);
      res.status(200).json(AuthResponseMapper.toSuccess());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      await this.sendVerificationEmailService.execute(req.body.email);
      res.status(200).json(AuthResponseMapper.toSuccess());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof DomainError || error instanceof InvalidStateError) {
      const msg = error.message;

      if (msg === 'Email already in use') {
        res.status(409).json(AuthResponseMapper.toError('CONFLICT', msg));
        return;
      }

      if (msg === 'Session not found' || msg === 'User not found') {
        res.status(404).json(AuthResponseMapper.toError('NOT_FOUND', msg));
        return;
      }

      if (msg === 'User is invalid or locked') {
        res.status(403).json(AuthResponseMapper.toError('FORBIDDEN', msg));
        return;
      }

      const unauthorizedMessages = [
        'Invalid credentials',
        'Invalid refresh token',
        'Invalid refresh token payload',
        'Token replay detected',
        'Session is revoked',
        'Session expired',
        'Invalid tokens provided for logout',
        'Invalid refresh token for session',
        'Invalid or expired reset token'
      ];

      if (unauthorizedMessages.includes(msg)) {
        res.status(401).json(AuthResponseMapper.toError('UNAUTHORIZED', msg));
        return;
      }

      res.status(400).json(AuthResponseMapper.toError('BAD_REQUEST', msg));
      return;
    }

    res.status(500).json(AuthResponseMapper.toError('INTERNAL_ERROR', 'An unexpected error occurred'));
  }
}
