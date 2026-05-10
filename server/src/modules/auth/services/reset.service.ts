import { passwordResetRepository } from "@/modules/auth/repositories/password-reset.repository";
import { userRepository } from "@/modules/auth/repositories/user.repository";
import { passwordService } from "@/modules/auth/services/password.service";
import { tokenService } from "@/modules/auth/services/token.service";
import { mailer } from "@/modules/auth/services/mailer.service";
import { randomToken, hashToken } from "@/core/crypto";
import { ResetTokenInvalid } from "@/core/errors";
import { env } from "@/core/config/env";

const RESET_TTL_MS = 60 * 60 * 1000;

export const resetService = {
  // step 1: user requests a reset link
  async requestReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const plain = randomToken();
    const tokenHash = hashToken(plain);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await passwordResetRepository.create({ userId: user.id, tokenHash, expiresAt });

    const link = `${env.APP_URL}/reset?token=${plain}`;
    await mailer.send({
      to: user.email,
      subject: "Reset your Traveloop password",
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Reset your password using the link below. It expires in 1 hour.</p>
        <p><a href="${link}">${link}</a></p>
        <p>If you didn't ask for this, ignore the email.</p>
      `,
    });
  },

  // step 2: user submits the new password with the token from email
  async confirmReset(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const row = await passwordResetRepository.findActiveByHash(tokenHash);
    if (!row) throw new ResetTokenInvalid();

    const password = await passwordService.hash(newPassword);
    await userRepository.update(row.userId, { password });
    await passwordResetRepository.markUsed(row.id);
    // kick every existing session — old refresh tokens shouldn't survive a password reset
    await tokenService.revokeAllForUser(row.userId);
  },
};
