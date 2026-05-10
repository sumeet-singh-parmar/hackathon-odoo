import { Router } from "express";
import { CreateStopSchema, ReorderStopsSchema, UpdateStopSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import * as stopService from "@/modules/trips/stop/stop.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

// Mounted at /api/trips/:tripId/stops
export const tripStopsRouter = Router({ mergeParams: true });
tripStopsRouter.use(requireAuth);

tripStopsRouter.post("/", validateBody(CreateStopSchema), async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.status(201).json(await stopService.create(req.userId!, tripId, req.body));
  } catch (err) { next(err); }
});

tripStopsRouter.patch("/reorder", validateBody(ReorderStopsSchema), async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await stopService.reorder(req.userId!, tripId, req.body));
  } catch (err) { next(err); }
});

// Mounted at /api/stops
export const stopRouter = Router();
stopRouter.use(requireAuth);

stopRouter.patch("/:id", validateBody(UpdateStopSchema), async (req, res, next) => {
  try {
    res.json(await stopService.update(req.userId!, parseId(req.params.id, "stop id"), req.body));
  } catch (err) { next(err); }
});

stopRouter.delete("/:id", async (req, res, next) => {
  try {
    await stopService.remove(req.userId!, parseId(req.params.id, "stop id"));
    res.status(204).end();
  } catch (err) { next(err); }
});
