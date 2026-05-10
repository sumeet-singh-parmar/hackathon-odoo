import { Router } from "express";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { cacheControl } from "@/core/middleware/cache-control";
import { BadRequest } from "@/core/errors";
import * as share from "@/modules/share/share.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

function parseSlug(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) throw new BadRequest("Invalid slug");
  return raw;
}

// Mounted at /api/trips/:tripId/share — auth-gated
export const tripShareRouter = Router({ mergeParams: true });
tripShareRouter.use(requireAuth);

tripShareRouter.post("/", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await share.share(req.userId!, tripId));
  } catch (err) { next(err); }
});

tripShareRouter.delete("/", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await share.unshare(req.userId!, tripId));
  } catch (err) { next(err); }
});

// Mounted at /api/public — public read + auth-gated copy
export const publicRouter = Router();

publicRouter.get("/trips/:slug", cacheControl(60), async (req, res, next) => {
  try {
    res.json(await share.getPublicBySlug(parseSlug(req.params.slug)));
  } catch (err) { next(err); }
});

publicRouter.post("/trips/:slug/copy", requireAuth, async (req, res, next) => {
  try {
    res.status(201).json(await share.copyFromSlug(req.userId!, parseSlug(req.params.slug)));
  } catch (err) { next(err); }
});

// Re-export under shareRouter for routes.ts back-compat
export const shareRouter = publicRouter;
