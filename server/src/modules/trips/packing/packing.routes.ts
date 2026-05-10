import { Router } from "express";
import { CreatePackingItemSchema, UpdatePackingItemSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import * as service from "@/modules/trips/packing/packing.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

// Mounted at /api/trips/:tripId/packing
export const packingRouter = Router({ mergeParams: true });
packingRouter.use(requireAuth);

packingRouter.get("/", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await service.list(req.userId!, tripId));
  } catch (err) { next(err); }
});

packingRouter.post("/", validateBody(CreatePackingItemSchema), async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.status(201).json(await service.create(req.userId!, tripId, req.body));
  } catch (err) { next(err); }
});

packingRouter.post("/reset", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await service.resetAll(req.userId!, tripId));
  } catch (err) { next(err); }
});

// Mounted at /api/packing-items
export const packingItemRouter = Router();
packingItemRouter.use(requireAuth);

packingItemRouter.patch("/:id", validateBody(UpdatePackingItemSchema), async (req, res, next) => {
  try {
    res.json(await service.update(req.userId!, parseId(req.params.id, "packing item id"), req.body));
  } catch (err) { next(err); }
});

packingItemRouter.delete("/:id", async (req, res, next) => {
  try {
    await service.remove(req.userId!, parseId(req.params.id, "packing item id"));
    res.status(204).end();
  } catch (err) { next(err); }
});
