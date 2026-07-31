import { PrismaClient } from '@prisma/client';
import { IEmailVerificationTokenRepository } from '../interfaces/IEmailVerificationTokenRepository';
import { EmailVerificationToken } from '../../../core/domain/EmailVerificationToken';

export class PrismaEmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(token: EmailVerificationToken): Promise<void> {
    await this.prisma.emailVerificationToken.create({
      data: {
        token: token.token,
        userId: token.userId,
        expiresAt: token.expiresAt,
        isUsed: token.isUsed,
      },
    });
  }
}
