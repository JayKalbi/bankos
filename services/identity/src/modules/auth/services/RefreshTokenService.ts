import { IDeviceSessionRepository } from '../interfaces/IDeviceSessionRepository';
import { ITokenService } from '../interfaces/ITokenService';
import { IClock } from '../interfaces/IClock';
import { IRandomGenerator } from '../interfaces/IRandomGenerator';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { IUserRepository } from '../interfaces/IUserRepository';
import { DomainError } from '../../../core/errors/DomainError';
import { AuthorizationEngine } from '../engine/AuthorizationEngine';

export class RefreshTokenService {
  constructor(
    private readonly deviceSessionRepository: IDeviceSessionRepository,
    private readonly tokenService: ITokenService,
    private readonly clock: IClock,
    private readonly randomGenerator: IRandomGenerator,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly userRepository: IUserRepository,
    private readonly authEngine: AuthorizationEngine
  ) {}

  public async execute(refreshToken: string, ipAddress: string, userAgent: string) {
    let decoded;
    try {
      decoded = this.tokenService.verifyRefreshToken<{ sub: string; sessionId: string }>(refreshToken);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = err;
      throw new DomainError('Invalid refresh token');
    }

    const { sub: userId, sessionId } = decoded;

    const hashedToken = this.randomGenerator.hashString(refreshToken);

    const session = await this.deviceSessionRepository.findByRefreshToken(hashedToken);

    if (!session) {
      throw new DomainError('Session not found');
    }

    if (session.refreshToken !== hashedToken) {
      const allSessions = await this.deviceSessionRepository.findActiveSessions(userId);
      for (const s of allSessions) {
        s.revoke('Token replay detected');
        await this.deviceSessionRepository.save(s);
        await this.eventDispatcher.dispatch(s.domainEvents);
        s.clearEvents();
      }
      throw new DomainError('Token replay detected');
    }

    if (session.isRevoked) {
      throw new DomainError('Session is revoked');
    }

    if (session.id !== sessionId) {
       throw new DomainError('Session mismatch');
    }

    const now = this.clock.now();
    if (session.isExpired(now)) {
      throw new DomainError('Session expired');
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.isLocked) {
      throw new DomainError('User is locked or disabled');
    }

    session.revoke();
    await this.deviceSessionRepository.save(session);

    const directRoles = await this.userRepository.findRoles(user.id);
    const effectiveRoles = await this.authEngine.resolveRoles(directRoles);
    const effectivePermissions = await this.authEngine.resolvePermissions(directRoles);

    const newSessionId = this.randomGenerator.generateUUID();
    const payload = {
      roles: effectiveRoles,
      permissions: effectivePermissions,
      sessionId: newSessionId,
      tokenVersion: 1,
      tenantId: 'default'
    };

    const newAccessToken = this.tokenService.generateAccessToken(payload, userId);
    const newRefreshTokenStr = this.tokenService.generateRefreshToken(payload, userId);

    const newDecodedRefresh = this.tokenService.decode<{ exp: number }>(newRefreshTokenStr);
    const newExpiresAt = newDecodedRefresh && newDecodedRefresh.exp
      ? new Date(newDecodedRefresh.exp * 1000)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const newHashedRefresh = this.randomGenerator.hashString(newRefreshTokenStr);

    const newSession = session.rotate(
      newSessionId,
      newHashedRefresh,
      ipAddress,
      userAgent,
      newExpiresAt,
      now
    );

    await this.deviceSessionRepository.save(newSession);

    // dispatch domain events if needed, but session rotate might not have new domain events added directly here,
    // though the aggregate does have them.
    for (const event of newSession.domainEvents) {
      event.metadata = { ipAddress, userAgent };
    }
    await this.eventDispatcher.dispatch(newSession.domainEvents);
    newSession.clearEvents();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenStr
    };
  }
}
