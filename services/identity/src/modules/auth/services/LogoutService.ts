import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { LogoutRequest } from '../dtos/LogoutRequest';
import { ITokenService } from '../interfaces/ITokenService';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { ITokenBlacklistService } from '../interfaces/ITokenBlacklistService';
import { IClock } from '../interfaces/IClock';
import { DomainError } from '../../../core/errors/DomainError';

export class LogoutService {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly tokenBlacklistService: ITokenBlacklistService,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async execute(request: LogoutRequest, ipAddress: string, userAgent: string): Promise<void> {
    // 1. Blacklist Access Token JTI
    let accessTokenPayload: { jti?: string; exp?: number; sessionId?: string } | null = null;
    try {
      // Decode instead of verify in case it is already expired (we still want to logout the session)
      accessTokenPayload = this.tokenService.decode(request.accessToken);
    } catch {
      // Ignore decode errors
    }

    if (accessTokenPayload && accessTokenPayload.jti && accessTokenPayload.exp) {
      const remainingLifetimeSeconds = accessTokenPayload.exp - this.clock.unix();
      if (remainingLifetimeSeconds > 0) {
        await this.tokenBlacklistService.blacklistToken(accessTokenPayload.jti, remainingLifetimeSeconds);
      }
    }

    // 2. Find and Revoke Device Session
    let sessionId = accessTokenPayload?.sessionId;

    if (!sessionId) {
      try {
        const refreshPayload = this.tokenService.decode<{ sessionId?: string }>(request.refreshToken);
        sessionId = refreshPayload?.sessionId;
      } catch {
        // Ignore decode errors
      }
    }

    if (!sessionId) {
      throw new DomainError('Invalid tokens provided for logout');
    }

    const deviceSession = await this.deviceSessionRepository.findById(sessionId);

    if (deviceSession && !deviceSession.isRevoked) {
      // Verify refresh token hash to ensure the logout is authorized for this specific session chain
      const incomingHash = this.randomGenerator.hashString(request.refreshToken);
      if (deviceSession.refreshToken === incomingHash) {
        deviceSession.revoke('User requested logout');
        await this.deviceSessionRepository.save(deviceSession);

        for (const event of deviceSession.domainEvents) {
          event.metadata = { ipAddress, userAgent };
        }
        await this.eventDispatcher.dispatch(deviceSession.domainEvents);
        deviceSession.clearEvents();
      } else {
        throw new DomainError('Invalid refresh token for session');
      }
    }
  }
}
