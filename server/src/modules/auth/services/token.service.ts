import jwt, { type SignOptions } from "jsonwebtoken";
import ms from "ms";
import { env } from "@/core/config/env";
import { randomToken, hashToken } from "@/core/crypto";
import { refreshTokenRepository } from "@/modules/auth/repositories/refresh-token.repository";
import { TokenInvalid } from "@/core/errors";
import type { UserRole } from "@prisma/client";

export interface AccessClaims {
  userId: number;
  role: UserRole;
}

export const tokenService = {
  signAccess(claims: AccessClaims): string {
    const opts: SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"] };
    return jwt.sign(claims, env.JWT_SECRET, opts);
  },

  verifyAccess(token: string): AccessClaims {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AccessClaims;
    } catch {
      throw new TokenInvalid();
    }
  },

  // returns the plaintext refresh + persists the hash
  async issueRefresh(userId: number, ctx: { userAgent?: string; ipAddress?: string }) {
    const plain = randomToken();
    const tokenHash = hashToken(plain);
    const ttlMs = ms(env.REFRESH_TOKEN_TTL as ms.StringValue);
    const expiresAt = new Date(Date.now() + ttlMs);

    await refreshTokenRepository.issue({
      userId,
      tokenHash,
      expiresAt,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    });

    return { plain, expiresAt };
  },

  async consumeRefresh(plain: string) {
    const tokenHash = hashToken(plain);
    const row = await refreshTokenRepository.findActiveByHash(tokenHash);
    if (!row) throw new TokenInvalid();
    return row;
  },

  async revokeRefresh(plain: string) {
    const tokenHash = hashToken(plain);
    await refreshTokenRepository.revokeByHash(tokenHash);
  },

  async revokeAllForUser(userId: number) {
    await refreshTokenRepository.revokeAllForUser(userId);
  },
};
