import { Router } from "express";
import { SaveDestinationSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import { savedDestinationsService } from "@/modules/profile/saved-destinations/saved-destinations.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

export const savedDestinationsRouter = Router();
savedDestinationsRouter.use(requireAuth);

savedDestinationsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await savedDestinationsService.list(req.userId!));
  } catch (err) {
    next(err);
  }
});

savedDestinationsRouter.post(
  "/",
  validateBody(SaveDestinationSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await savedDestinationsService.add(req.userId!, req.body.cityId));
    } catch (err) {
      next(err);
    }
  },
);

savedDestinationsRouter.delete("/:cityId", async (req, res, next) => {
  try {
    await savedDestinationsService.remove(req.userId!, parseId(req.params.cityId, "city id"));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
