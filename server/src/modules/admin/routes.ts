import { Router } from "express";
import { z } from "zod";
import { UpdateUserRoleSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { requireRole } from "@/modules/auth/middleware/require-role";
import { adminService } from "@/modules/admin/admin.service";
import { BadRequest } from "@/core/errors";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const stats = await adminService.stats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// rich analytics view (totals, top cities/activities, recents).
adminRouter.get("/analytics", async (_req, res, next) => {
  try {
    const result = await adminService.analytics();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (req, res, next) => {
  try {
    const parsed = ListQuerySchema.safeParse(req.query);
    if (!parsed.success) return next(parsed.error);

    const result = await adminService.listUsers(parsed.data.page, parsed.data.pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/users/:id", async (req, res, next) => {
  try {
    const params = IdParamSchema.safeParse(req.params);
    if (!params.success) return next(params.error);

    const body = UpdateUserRoleSchema.safeParse(req.body);
    if (!body.success) return next(body.error);

    if (params.data.id === req.userId) {
      return next(new BadRequest("You cannot change your own role"));
    }

    const user = await adminService.setRole(params.data.id, body.data.role);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/users/:id", async (req, res, next) => {
  try {
    const params = IdParamSchema.safeParse(req.params);
    if (!params.success) return next(params.error);

    if (params.data.id === req.userId) {
      return next(new BadRequest("You cannot delete yourself"));
    }

    await adminService.deleteUser(params.data.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
