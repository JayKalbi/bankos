import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { RefreshTokenRequest } from '../dtos/RefreshTokenRequest';
import { RefreshTokenResponse } from '../dtos/RefreshTokenResponse';
import { IUserRepository } from '../interfaces/IUserRepository';
import { ITokenService } from '../interfaces/ITokenService';
import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { IClock } from '../interfaces/IClock';
import { DomainError } from '../../../core/errors/DomainError';

export class RefreshTokenService {
  private readonly ABSOLUTE_MAX_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly randomGenerator: IRandomGenerator,
    private readonly clock: IClock
  ) {}

  public async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    let payload: { sessionId: string };
    
    try {
      payload = this.tokenService.verifyRefreshToken<{ sessionId: string }>(request.refreshToken);
    } catch {
      throw new DomainError('Invalid refresh token');
    }

    if (!payload.sessionId) {
      throw new DomainError('Invalid refresh token payload');
    }

    const deviceSession = await this.deviceSessionRepository.findById(payload.sessionId);

    if (!deviceSession) {
      throw new DomainError('Session not found');
    }

    const incomingHash = this.randomGenerator.hashString(request.refreshToken);

    // Replay Detection
    if (deviceSession.refreshToken !== incomingHash) {
      if (!deviceSession.isRevoked) {
        deviceSession.revoke('Replay detected');
        await this.deviceSessionRepository.save(deviceSession);
        
        for (const event of deviceSession.domainEvents) {
          event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
        }
        await this.eventDispatcher.dispatch(deviceSession.domainEvents);
        deviceSession.clearEvents();
      }
      throw new DomainError('Token replay detected');
    }

    if (deviceSession.isRevoked) {
      throw new DomainError('Session is revoked');
    }

    if (deviceSession.expiresAt < this.clock.now()) {
      throw new DomainError('Session expired');
    }

    const user = await this.userRepository.findById(deviceSession.userId);
    if (!user || user.isLocked) {
      throw new DomainError('User is invalid or locked');
    }

    // Generate new tokens
    const newPayload = {
      roles: user.roles,
      sessionId: deviceSession.id
    };

    const newAccessToken = this.tokenService.generateAccessToken(newPayload, user.id);
    const newRefreshToken = this.tokenService.generateRefreshToken(newPayload, user.id);
    
    const newHash = this.randomGenerator.hashString(newRefreshToken);

    const decodedRefresh = this.tokenService.decode<{ exp: number }>(newRefreshToken);
    const slidingExpiration = decodedRefresh && decodedRefresh.exp 
      ? new Date(decodedRefresh.exp * 1000) 
      : new Date(this.clock.now().getTime() + 7 * 24 * 60 * 60 * 1000);

    const absoluteMaxExpiration = new Date(deviceSession.createdAt.getTime() + this.ABSOLUTE_MAX_LIFETIME_MS);

    deviceSession.rotateToken(newHash, slidingExpiration, absoluteMaxExpiration);

    await this.deviceSessionRepository.save(deviceSession);

    for (const event of deviceSession.domainEvents) {
      event.metadata = { ipAddress: request.ipAddress, userAgent: request.userAgent };
    }
    await this.eventDispatcher.dispatch(deviceSession.domainEvents);
    deviceSession.clearEvents();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}
