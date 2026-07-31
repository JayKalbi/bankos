import { DeviceSession } from '../../../core/domain/DeviceSession';

export interface IDeviceSessionRepository {
  findById(id: string): Promise<DeviceSession | null>;
  findByRefreshToken(hashedToken: string): Promise<DeviceSession | null>;
  findActiveSessions(userId: string): Promise<DeviceSession[]>;
  save(session: DeviceSession): Promise<void>;
  revokeSession(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
