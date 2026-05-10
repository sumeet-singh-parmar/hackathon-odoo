import { Router, type RequestHandler } from "express";
import { CitySearchQuerySchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { cacheControl } from "@/core/middleware/cache-control";
import { BadRequest } from "@/core/errors";
import * as service from "@/modules/cities/city/city.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

export const cityRouter = Router();
cityRouter.use(requireAuth);

const searchHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = CitySearchQuerySchema.parse(req.query);
    res.json(await service.search(query));
  } catch (err) {
    next(err);
  }
};

// `GET /api/cities` — paginated search at the root path (preferred by client).
cityRouter.get("/", cacheControl(300), searchHandler);
// alias kept for any callers still using `/search`.
cityRouter.get("/search", cacheControl(300), searchHandler);

cityRouter.get("/:id", cacheControl(1800), async (req, res, next) => {
  try {
    res.json(await service.getById(parseId(req.params.id, "city id")));
  } catch (err) {
    next(err);
  }
});
