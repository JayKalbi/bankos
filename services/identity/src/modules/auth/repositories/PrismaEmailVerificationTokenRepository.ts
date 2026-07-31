import { PrismaClient } from '@prisma/client';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export class PrismaEmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(token: EmailVerificationToken): Promise<void> {
    await this.prisma.emailVerificationToken.upsert({
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

  public async findByToken(hashedToken: string): Promise<EmailVerificationToken | null> {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record) {
      return null;
    }

    return new EmailVerificationToken(
      record.token,
      record.userId,
      record.expiresAt,
      record.isUsed
    );
  }

  public async delete(hashedToken: string): Promise<void> {
    try {
      await this.prisma.emailVerificationToken.delete({
        where: { token: hashedToken },
      });
    } catch {
      // Ignore if record doesn't exist
    }
  }
}
