import type { PasswordReset } from "@prisma/client";
import { prisma } from "@/core/prisma";

export interface CreatePasswordResetInput {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export interface IPasswordResetRepository {
  create(input: CreatePasswordResetInput): Promise<PasswordReset>;
  findActiveByHash(tokenHash: string): Promise<PasswordReset | null>;
  markUsed(id: string): Promise<void>;
}

export const passwordResetRepository: IPasswordResetRepository = {
  create: (input) => prisma.passwordReset.create({ data: input }),

  findActiveByHash: (tokenHash) =>
    prisma.passwordReset.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    }),

  markUsed: async (id) => {
    await prisma.passwordReset.update({ where: { id }, data: { usedAt: new Date() } });
  },
};
