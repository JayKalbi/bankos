import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaUserRepository } from '../../../../src/modules/auth/repositories/PrismaUserRepository';
import { User } from '../../../../src/core/domain/User';

describe('PrismaUserRepository', () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: PrismaUserRepository;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new PrismaUserRepository(prismaMock as unknown as PrismaClient);
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const dbRecord = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        isLocked: false,
        failedLoginAttempts: 0,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: []
      };

      prismaMock.user.findUnique.mockResolvedValue(dbRecord);

      const user = await repository.findById('123');
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(user?.isLocked).toBe(false);
    });

    it('should return null if not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await repository.findById('123');
      expect(user).toBeNull();
    });
  });

  describe('save', () => {
    it('should insert a new user', async () => {
      const user = new User('123', 'new@example.com', 'hash', false, 0, false, true);

      prismaMock.user.create.mockResolvedValue({} as any);

      await repository.save(user);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      const callArgs = prismaMock.user.create.mock.calls[0][0];
      expect(callArgs.data.email).toBe('new@example.com');
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const user = new User('123', 'exist@example.com', 'hash', true, 5, false, false);

      prismaMock.user.update.mockResolvedValue({} as any);

      await repository.update(user);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      const callArgs = prismaMock.user.update.mock.calls[0][0];
      expect(callArgs.where.id).toBe('123');
      expect(callArgs.data.isLocked).toBe(true);
      expect(callArgs.data.failedLoginAttempts).toBe(5);
    });
  });
});
