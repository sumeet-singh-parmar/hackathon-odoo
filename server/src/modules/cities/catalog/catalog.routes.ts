import { Router } from "express";
import { ActivitySearchQuerySchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { cacheControl } from "@/core/middleware/cache-control";
import { BadRequest } from "@/core/errors";
import * as service from "@/modules/cities/catalog/catalog.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

export const catalogRouter = Router();
catalogRouter.use(requireAuth);

catalogRouter.get("/search", cacheControl(300), async (req, res, next) => {
  try {
    const query = ActivitySearchQuerySchema.parse(req.query);
    res.json(await service.search(query));
  } catch (err) { next(err); }
});

catalogRouter.get("/:id", cacheControl(1800), async (req, res, next) => {
  try {
    res.json(await service.getById(parseId(req.params.id, "activity id")));
  } catch (err) { next(err); }
});
