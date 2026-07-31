import { PrismaClient } from '@prisma/client';
import { IPasswordResetTokenRepository } from '../interfaces/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../../core/domain/PasswordResetToken';

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(token: PasswordResetToken): Promise<void> {
    await this.prisma.passwordResetToken.upsert({
      where: { token: token.token },
      update: {
        userId: token.userId,
        expiresAt: token.expiresAt,
        isUsed: token.isUsed,
      },
      create: {
        token: token.token,
        userId: token.userId,
        expiresAt: token.expiresAt,
        isUsed: token.isUsed,
      },
    });
  }

  public async findByToken(hashedToken: string): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record) {
      return null;
    }

    return new PasswordResetToken(
      record.token,
      record.userId,
      record.expiresAt,
      record.isUsed
    );
  }

  public async delete(hashedToken: string): Promise<void> {
    try {
      await this.prisma.passwordResetToken.delete({
        where: { token: hashedToken },
      });
    } catch {
      // Ignore if record doesn't exist
    }
  }
}
