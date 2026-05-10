import type { RefreshToken } from "@prisma/client";
import { prisma } from "@/core/prisma";

export interface IssueRefreshTokenInput {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface IRefreshTokenRepository {
  issue(input: IssueRefreshTokenInput): Promise<RefreshToken>;
  findActiveByHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeByHash(tokenHash: string): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
}

export const refreshTokenRepository: IRefreshTokenRepository = {
  issue: (input) => prisma.refreshToken.create({ data: input }),

  findActiveByHash: (tokenHash) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    }),

  revokeByHash: async (tokenHash) => {
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllForUser: async (userId) => {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
