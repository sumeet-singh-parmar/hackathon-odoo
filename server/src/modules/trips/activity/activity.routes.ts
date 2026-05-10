import { Router } from "express";
import { PinActivitySchema, UpdateTripActivitySchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import * as service from "@/modules/trips/activity/activity.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

// Mounted at /api/stops/:stopId/activities — POST to pin
export const stopActivitiesRouter = Router({ mergeParams: true });
stopActivitiesRouter.use(requireAuth);

stopActivitiesRouter.post("/", validateBody(PinActivitySchema), async (req, res, next) => {
  try {
    const stopId = parseId((req.params as Record<string, unknown>).stopId, "stop id");
    res.status(201).json(await service.pin(req.userId!, stopId, req.body));
  } catch (err) { next(err); }
});

// Mounted at /api/trip-activities — PATCH/DELETE one
export const tripActivityRouter = Router();
tripActivityRouter.use(requireAuth);

tripActivityRouter.patch("/:id", validateBody(UpdateTripActivitySchema), async (req, res, next) => {
  try {
    res.json(await service.update(req.userId!, parseId(req.params.id, "trip activity id"), req.body));
  } catch (err) { next(err); }
});

tripActivityRouter.delete("/:id", async (req, res, next) => {
  try {
    await service.unpin(req.userId!, parseId(req.params.id, "trip activity id"));
    res.status(204).end();
  } catch (err) { next(err); }
});

// keep activityRouter export for the trips/routes.ts old reference
export const activityRouter = tripActivityRouter;
