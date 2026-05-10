import { Router } from "express";
import { CreateTripSchema, ListTripsQuerySchema, UpdateTripSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { BadRequest } from "@/core/errors";
import {
  tripCoverUpload,
  publicTripCoverPath,
  removeTripCoverFile,
} from "@/modules/trips/trip/trip-cover-upload";
import * as tripService from "@/modules/trips/trip/trip.service";

export const tripRouter = Router();

function parseId(raw: unknown): number {
  if (typeof raw !== "string") throw new BadRequest("Invalid trip id");
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest("Invalid trip id");
  return id;
}

// `/featured` is public — banner carousel hits it before sign-in.
// Must come BEFORE the router-level requireAuth and BEFORE `/:id`.
tripRouter.get("/featured", async (_req, res, next) => {
  try {
    res.json(await tripService.listFeatured());
  } catch (err) {
    next(err);
  }
});

tripRouter.use(requireAuth);

// Multipart-aware POST: body fields land in req.body (as strings via multer),
// the optional cover image lands in req.file.
tripRouter.post("/", tripCoverUpload, async (req, res, next) => {
  try {
    const parsed = CreateTripSchema.safeParse(coerceBody(req.body));
    if (!parsed.success) return next(parsed.error);
    const coverPhotoUrl = req.file ? publicTripCoverPath(req.file.filename) : undefined;
    const trip = await tripService.create(req.userId!, parsed.data, coverPhotoUrl);
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

tripRouter.get("/", async (req, res, next) => {
  try {
    const query = ListTripsQuerySchema.parse(req.query);
    res.json(await tripService.list(req.userId!, query));
  } catch (err) {
    next(err);
  }
});

tripRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await tripService.getById(req.userId!, parseId(req.params.id)));
  } catch (err) {
    next(err);
  }
});

// Multipart-aware PATCH: replaces the cover when a file is uploaded; cleans up
// the old file from disk on success.
tripRouter.patch("/:id", tripCoverUpload, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const parsed = UpdateTripSchema.safeParse(coerceBody(req.body));
    if (!parsed.success) return next(parsed.error);

    let prevCover: string | null = null;
    if (req.file) {
      const existing = await tripService.getById(req.userId!, id);
      prevCover = existing.coverPhotoUrl;
    }

    const patch = req.file
      ? { ...parsed.data, coverPhotoUrl: publicTripCoverPath(req.file.filename) }
      : parsed.data;

    const trip = await tripService.update(req.userId!, id, patch);

    if (req.file && prevCover) removeTripCoverFile(prevCover);

    res.json(trip);
  } catch (err) {
    next(err);
  }
});

tripRouter.delete("/:id", async (req, res, next) => {
  try {
    await tripService.remove(req.userId!, parseId(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Multer parses multipart fields into strings; coerce known numeric/boolean
// fields back so Zod accepts them. Unknown fields pass through unchanged.
function coerceBody(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const out: Record<string, unknown> = { ...(raw as Record<string, unknown>) };
  if (typeof out.budget === "string" && out.budget.trim() !== "") {
    const n = Number(out.budget);
    if (!Number.isNaN(n)) out.budget = n;
  }
  return out;
}
