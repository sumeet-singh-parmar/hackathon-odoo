import { Prisma } from "@prisma/client";
import type {
  ActivityListResponse,
  ActivityResponse,
  ActivitySearchQuery,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { cached } from "@/core/cache";
import { NotFound } from "@/core/errors";

const activitySelect = {
  id: true,
  cityId: true,
  name: true,
  type: true,
  baseCost: true,
  durationHours: true,
  description: true,
  createdAt: true,
} satisfies Prisma.ActivitySelect;

type Row = Prisma.ActivityGetPayload<{ select: typeof activitySelect }>;

function toResponse(row: Row): ActivityResponse {
  return {
    id: row.id,
    cityId: row.cityId,
    name: row.name,
    type: row.type,
    baseCost: row.baseCost,
    durationHours: row.durationHours,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function search(query: ActivitySearchQuery): Promise<ActivityListResponse> {
  const cacheKey = `activities:search:${JSON.stringify(query)}`;
  return cached(cacheKey, 5 * 60 * 1000, async () => {
    const { q, cityId, type, maxCost, maxDuration, page, limit } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.ActivityWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(cityId !== undefined ? { cityId } : {}),
      ...(type ? { type } : {}),
      ...(maxCost !== undefined ? { baseCost: { lte: maxCost } } : {}),
      ...(maxDuration !== undefined ? { durationHours: { lte: maxDuration } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: [{ name: "asc" }],
        skip,
        take: limit,
        select: activitySelect,
      }),
      prisma.activity.count({ where }),
    ]);
    return { items: rows.map(toResponse), total, page, limit };
  });
}

export async function getById(id: number): Promise<ActivityResponse> {
  return cached(`activities:${id}`, 30 * 60 * 1000, async () => {
    const activity = await prisma.activity.findUnique({ where: { id }, select: activitySelect });
    if (!activity) throw new NotFound("Activity not found");
    return toResponse(activity);
  });
}
