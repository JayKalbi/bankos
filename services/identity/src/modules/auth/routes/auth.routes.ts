import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../../../middlewares/validateRequest';
import { extractClientMeta } from '../../../middlewares/extractClientMeta';
import { extractAuthToken } from '../../../middlewares/extractAuthToken';
import { AuthValidators } from '../validators/AuthValidators';

// Database & Redis
import { prisma } from '../../../infrastructure/database/client';
import { redisClient } from '../../../infrastructure/redis/client';

// Repositories
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaRoleRepository } from '../repositories/PrismaRoleRepository';
import { PrismaDeviceSessionRepository } from '../repositories/PrismaDeviceSessionRepository';
import { PrismaAuditRepository } from '../repositories/PrismaAuditRepository';
import { PrismaPasswordResetTokenRepository } from '../repositories/PrismaPasswordResetTokenRepository';
import { PrismaEmailVerificationTokenRepository } from '../repositories/PrismaEmailVerificationTokenRepository';

// Crypto & Infrastructure
import { Argon2PasswordHasher } from '../../../infrastructure/crypto/Argon2PasswordHasher';
import { JwtTokenService } from '../../../infrastructure/crypto/JwtTokenService';
import { SecureRandomGenerator } from '../../../infrastructure/crypto/SecureRandomGenerator';
import { SystemClock } from '../../../infrastructure/crypto/SystemClock';
import { ConsoleMailer } from '../../../infrastructure/email/ConsoleMailer';

// Redis Services
import { RedisTokenBlacklistService } from '../../../infrastructure/redis/RedisTokenBlacklistService';

// Application Services
import { RegisterUserService } from '../services/RegisterUserService';
import { LoginService } from '../services/LoginService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { LogoutService } from '../services/LogoutService';
import { ForgotPasswordService } from '../services/ForgotPasswordService';
import { ResetPasswordService } from '../services/ResetPasswordService';
import { VerifyEmailService } from '../services/VerifyEmailService';
import { SendVerificationEmailService } from '../services/SendVerificationEmailService';

// Instantiate Repositories
const userRepository = new PrismaUserRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const deviceSessionRepository = new PrismaDeviceSessionRepository(prisma);
const auditRepository = new PrismaAuditRepository(prisma);
const passwordResetRepo = new PrismaPasswordResetTokenRepository(prisma);
const emailVerificationRepo = new PrismaEmailVerificationTokenRepository(prisma);

// Instantiate Crypto & Infrastructure
const passwordHasher = new Argon2PasswordHasher();
const tokenService = new JwtTokenService();
const randomGenerator = new SecureRandomGenerator();
const clock = new SystemClock();
const mailer = new ConsoleMailer();

// Instantiate Redis Services
const blacklistService = new RedisTokenBlacklistService(redisClient);

// Instantiate Application Services
const registerUserService = new RegisterUserService(userRepository, roleRepository, passwordHasher, randomGenerator, emailVerificationRepo, auditRepository, clock);
const loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, auditRepository, clock);
const refreshTokenService = new RefreshTokenService(userRepository, tokenService, deviceSessionRepository, auditRepository, clock);
const logoutService = new LogoutService(tokenService, deviceSessionRepository, blacklistService, auditRepository, clock);
const forgotPasswordService = new ForgotPasswordService(userRepository, passwordResetRepo, mailer, randomGenerator, clock, auditRepository);
const resetPasswordService = new ResetPasswordService(userRepository, passwordResetRepo, passwordHasher, deviceSessionRepository, blacklistService, auditRepository, clock);
const verifyEmailService = new VerifyEmailService(userRepository, emailVerificationRepo, auditRepository, clock);
const sendVerificationService = new SendVerificationEmailService(userRepository, emailVerificationRepo, mailer, randomGenerator, clock);

// Instantiate Controller
const authController = new AuthController(
  registerUserService,
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  sendVerificationService
);

export const authRouter = Router();

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

authRouter.post('/register', validateRequest(AuthValidators.register), extractClientMeta, asyncHandler(authController.register.bind(authController)));
authRouter.post('/login', validateRequest(AuthValidators.login), extractClientMeta, asyncHandler(authController.login.bind(authController)));
authRouter.post('/refresh', validateRequest(AuthValidators.refresh), extractClientMeta, asyncHandler(authController.refresh.bind(authController)));
authRouter.post('/logout', validateRequest(AuthValidators.logout), extractClientMeta, extractAuthToken, asyncHandler(authController.logout.bind(authController)));
authRouter.post('/forgot-password', validateRequest(AuthValidators.forgotPassword), extractClientMeta, asyncHandler(authController.forgotPassword.bind(authController)));
authRouter.post('/reset-password', validateRequest(AuthValidators.resetPassword), extractClientMeta, asyncHandler(authController.resetPassword.bind(authController)));
authRouter.post('/verify-email', validateRequest(AuthValidators.verifyEmail), extractClientMeta, asyncHandler(authController.verifyEmail.bind(authController)));
authRouter.post('/send-verification', validateRequest(AuthValidators.sendVerificationEmail), extractClientMeta, asyncHandler(authController.sendVerificationEmail.bind(authController)));
