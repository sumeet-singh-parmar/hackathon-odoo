import { Router } from "express";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  UpdateMeSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import {
  avatarUpload,
  publicAvatarPath,
  removeAvatarFile,
} from "@/modules/auth/middleware/avatar-upload";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} from "@/modules/auth/middleware/rate-limit";
import { authService } from "@/modules/auth/services/auth.service";
import { resetService } from "@/modules/auth/services/reset.service";
import { bodyTransport } from "@/modules/auth/transport/body-transport";
import { userRepository } from "@/modules/auth/repositories/user.repository";

export const authRouter = Router();

const transport = bodyTransport;

authRouter.post("/register", registerLimiter, avatarUpload, async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const avatarUrl = req.file ? publicAvatarPath(req.file.filename) : undefined;
    const user = await authService.register({ ...parsed.data, avatarUrl });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const result = await authService.login(parsed.data.email, parsed.data.password, {
      userAgent: req.get("user-agent") ?? undefined,
      ipAddress: req.ip,
    });
    transport.sendPair(
      res,
      { accessToken: result.accessToken, refreshToken: result.refreshToken },
      { user: result.user },
    );
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const parsed = RefreshSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const result = await authService.refresh(parsed.data.refreshToken, {
      userAgent: req.get("user-agent") ?? undefined,
      ipAddress: req.ip,
    });
    transport.sendAccess(res, result.accessToken, result.refreshToken);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const parsed = LogoutSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    await authService.logout(parsed.data.refreshToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout-all", requireAuth, async (req, res, next) => {
  try {
    await authService.logoutAll(req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authService.me(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

authRouter.delete("/me", requireAuth, async (req, res, next) => {
  try {
    await authService.deleteSelf(req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/me", requireAuth, avatarUpload, async (req, res, next) => {
  try {
    const parsed = UpdateMeSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    let user;
    if (req.file) {
      const existing = await userRepository.findById(req.userId!);
      const newPath = publicAvatarPath(req.file.filename);
      user = await authService.updateMe(req.userId!, { ...parsed.data, avatarUrl: newPath });
      if (existing?.avatarUrl) removeAvatarFile(existing.avatarUrl);
    } else {
      user = await authService.updateMe(req.userId!, parsed.data);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgot-password", forgotPasswordLimiter, async (req, res, next) => {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    await resetService.requestReset(parsed.data.email);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    await resetService.confirmReset(parsed.data.token, parsed.data.newPassword);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
