import { Router } from "express";
import { LoginSchema, RegisterSchema } from "@hackathon/shared";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as authService from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", validateBody(RegisterSchema), async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

authRouter.post("/login", validateBody(LoginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await authService.me(req.userId!);
  res.json(user);
});
