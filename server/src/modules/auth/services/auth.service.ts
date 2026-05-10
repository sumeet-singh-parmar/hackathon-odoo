import type { User } from "@prisma/client";
import { userRepository } from "@/modules/auth/repositories/user.repository";
import { passwordService } from "@/modules/auth/services/password.service";
import { tokenService } from "@/modules/auth/services/token.service";
import { Conflict, Unauthorized } from "@/core/errors";

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  country: string;
  additionalInfo?: string;
  avatarUrl?: string;
}

export interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

export const authService = {
  async register(input: RegisterInput) {
    const [emailTaken, usernameTaken] = await Promise.all([
      userRepository.findByEmail(input.email),
      userRepository.findByUsername(input.username),
    ]);
    if (emailTaken) throw new Conflict("Email already registered");
    if (usernameTaken) throw new Conflict("Username already taken");

    const password = await passwordService.hash(input.password);
    const user = await userRepository.create({
      email: input.email,
      username: input.username,
      password,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      city: input.city,
      country: input.country,
      additionalInfo: input.additionalInfo ?? null,
      avatarUrl: input.avatarUrl ?? null,
    });
    return toPublic(user);
  },

  async login(email: string, plainPassword: string, ctx: RequestContext) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // burn time so the response timing doesn't leak whether the email exists
      await passwordService.dummyCompare(plainPassword);
      throw new Unauthorized("Invalid credentials");
    }
    const ok = await passwordService.compare(plainPassword, user.password);
    if (!ok) throw new Unauthorized("Invalid credentials");

    await userRepository.setLastLogin(user.id);
    const accessToken = tokenService.signAccess({ userId: user.id, role: user.role });
    const { plain: refreshToken } = await tokenService.issueRefresh(user.id, ctx);

    return { user: toPublic(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string, ctx: RequestContext) {
    const row = await tokenService.consumeRefresh(refreshToken);
    const user = await userRepository.findById(row.userId);
    if (!user) throw new Unauthorized();

    // rotate — the old token is dead the moment we issue the new one
    await tokenService.revokeRefresh(refreshToken);
    const accessToken = tokenService.signAccess({ userId: user.id, role: user.role });
    const { plain: nextRefresh } = await tokenService.issueRefresh(user.id, ctx);

    return { accessToken, refreshToken: nextRefresh };
  },

  async logout(refreshToken: string) {
    await tokenService.revokeRefresh(refreshToken);
  },

  async logoutAll(userId: number) {
    await tokenService.revokeAllForUser(userId);
  },

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Unauthorized();
    return toPublic(user);
  },

  async updateMe(userId: number, patch: Partial<RegisterInput> & { language?: string | null }) {
    if (patch.username) {
      const taken = await userRepository.findByUsername(patch.username);
      if (taken && taken.id !== userId) throw new Conflict("Username already taken");
    }
    const updated = await userRepository.update(userId, {
      username: patch.username,
      firstName: patch.firstName,
      lastName: patch.lastName,
      phoneNumber: patch.phoneNumber,
      city: patch.city,
      country: patch.country,
      additionalInfo: patch.additionalInfo,
      language: patch.language,
      avatarUrl: patch.avatarUrl,
    });
    return toPublic(updated);
  },

  async setAvatar(userId: number, avatarUrl: string) {
    const updated = await userRepository.update(userId, { avatarUrl });
    return toPublic(updated);
  },

  async deleteSelf(userId: number) {
    // refresh tokens cascade away with the user row.
    await userRepository.delete(userId);
  },
};

function toPublic(user: User) {
  const { password, ...rest } = user;
  void password;
  return rest;
}
