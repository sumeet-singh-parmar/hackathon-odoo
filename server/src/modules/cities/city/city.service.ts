import { Prisma } from "@prisma/client";
import type { CityListResponse, CityResponse, CitySearchQuery, CostIndex } from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { cached } from "@/core/cache";
import { NotFound } from "@/core/errors";

const citySelect = {
  id: true,
  name: true,
  country: true,
  costIndex: true,
  popularity: true,
  region: true,
  description: true,
  imageUrl: true,
  createdAt: true,
} satisfies Prisma.CitySelect;

type Row = Prisma.CityGetPayload<{ select: typeof citySelect }>;

function toResponse(row: Row): CityResponse {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    costIndex: Math.max(1, Math.min(4, Math.round(row.costIndex))) as CostIndex,
    popularity: row.popularity,
    region: row.region,
    description: row.description,
    blurb: row.description,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

function orderByFor(sort: CitySearchQuery["sort"]): Prisma.CityOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ name: "asc" }];
    case "cost":
      return [{ costIndex: "asc" }, { name: "asc" }];
    case "popularity":
    default:
      return [{ popularity: "desc" }, { name: "asc" }];
  }
}

export async function search(query: CitySearchQuery): Promise<CityListResponse> {
  const cacheKey = `cities:search:${JSON.stringify(query)}`;
  return cached(cacheKey, 5 * 60 * 1000, async () => {
    const { q, country, region, sort, costMax, page, limit } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.CityWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(country ? { country } : {}),
      ...(region ? { region } : {}),
      ...(costMax !== undefined ? { costIndex: { lte: costMax } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: orderByFor(sort),
        skip,
        take: limit,
        select: citySelect,
      }),
      prisma.city.count({ where }),
    ]);
    return { items: rows.map(toResponse), total, page, limit };
  });
}

export async function getById(id: number): Promise<CityResponse> {
  return cached(`cities:${id}`, 30 * 60 * 1000, async () => {
    const city = await prisma.city.findUnique({ where: { id }, select: citySelect });
    if (!city) throw new NotFound("City not found");
    return toResponse(city);
  });
}
