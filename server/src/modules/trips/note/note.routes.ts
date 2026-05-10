import { Router } from "express";
import { CreateTripNoteSchema, UpdateTripNoteSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import * as service from "@/modules/trips/note/note.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

// Mounted at /api/trips/:tripId/notes
export const tripNotesRouter = Router({ mergeParams: true });
tripNotesRouter.use(requireAuth);

tripNotesRouter.get("/", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await service.list(req.userId!, tripId));
  } catch (err) { next(err); }
});

tripNotesRouter.post("/", validateBody(CreateTripNoteSchema), async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.status(201).json(await service.create(req.userId!, tripId, req.body));
  } catch (err) { next(err); }
});

// Mounted at /api/notes
export const noteRouter = Router();
noteRouter.use(requireAuth);

noteRouter.patch("/:id", validateBody(UpdateTripNoteSchema), async (req, res, next) => {
  try {
    res.json(await service.update(req.userId!, parseId(req.params.id, "note id"), req.body));
  } catch (err) { next(err); }
});

noteRouter.delete("/:id", async (req, res, next) => {
  try {
    await service.remove(req.userId!, parseId(req.params.id, "note id"));
    res.status(204).end();
  } catch (err) { next(err); }
});
