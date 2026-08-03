import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { JwksController } from '../controllers/JwksController';
import { validateRequest } from '../../../middlewares/validateRequest';
import { extractClientMeta } from '../../../middlewares/extractClientMeta';
import { extractAuthToken } from '../../../middlewares/extractAuthToken';
import { AuthValidators } from '../validators/AuthValidators';
import { config } from '../../../config';

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
import { DomainEventDispatcher } from '../../../infrastructure/events/DomainEventDispatcher';
import { AuditEventHandler } from '../../../infrastructure/events/handlers/AuditEventHandler';
import { SystemClock } from '../../../infrastructure/crypto/SystemClock';
import { ConsoleMailer } from '../../../infrastructure/email/ConsoleMailer';
import { KeyLoader } from '../../../infrastructure/crypto/keys/KeyLoader';
import { KeyManager } from '../../../infrastructure/crypto/keys/KeyManager';
import { JwksBuilder } from '../../../infrastructure/crypto/keys/JwksBuilder';

// Redis Services
import { RedisTokenBlacklistService } from '../../../infrastructure/redis/RedisTokenBlacklistService';

// Engine
import { AuthorizationEngine } from '../engine/AuthorizationEngine';

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
const keyLoader = new KeyLoader(config.jwt.keys);
const keyManager = new KeyManager(keyLoader, config.jwt.activeKeyId);
const tokenService = new JwtTokenService(keyManager);
const randomGenerator = new SecureRandomGenerator();
const clock = new SystemClock();
const mailer = new ConsoleMailer();
const jwksBuilder = new JwksBuilder(keyManager);

// Instantiate Redis Services
const blacklistService = new RedisTokenBlacklistService(redisClient);

// Setup Engine
const authEngine = new AuthorizationEngine(roleRepository);

// Setup Event Dispatcher
const eventDispatcher = new DomainEventDispatcher();
const auditEventHandler = new AuditEventHandler(auditRepository, randomGenerator, clock);
eventDispatcher.register(auditEventHandler);

// Instantiate Application Services
const registerUserService = new RegisterUserService(userRepository, roleRepository, passwordHasher, randomGenerator, emailVerificationRepo, eventDispatcher, clock);
const loginService = new LoginService(userRepository, passwordHasher, tokenService, deviceSessionRepository, eventDispatcher, randomGenerator, clock, authEngine);
const refreshTokenService = new RefreshTokenService(deviceSessionRepository, tokenService, clock, randomGenerator, eventDispatcher, userRepository, authEngine);
const logoutService = new LogoutService(tokenService, deviceSessionRepository, blacklistService, eventDispatcher, randomGenerator, clock);
const forgotPasswordService = new ForgotPasswordService(userRepository, passwordResetRepo, mailer, randomGenerator, clock, eventDispatcher);
const resetPasswordService = new ResetPasswordService(userRepository, passwordResetRepo, passwordHasher, deviceSessionRepository, blacklistService, eventDispatcher, randomGenerator, clock);
const verifyEmailService = new VerifyEmailService(userRepository, emailVerificationRepo, eventDispatcher, randomGenerator, clock);
const sendVerificationService = new SendVerificationEmailService(userRepository, emailVerificationRepo, mailer, randomGenerator, clock);

// Instantiate Controllers
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
const jwksController = new JwksController(jwksBuilder);

export const authRouter = Router();
export const jwksRouter = Router();

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

jwksRouter.get('/.well-known/jwks.json', jwksController.getJwks);
