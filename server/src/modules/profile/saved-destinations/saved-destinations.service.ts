import type { SavedDestination } from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, NotFound } from "@/core/errors";

interface Row {
  id: number;
  createdAt: Date;
  city: { id: number; name: string; country: string; imageUrl: string | null };
}

function toResponse(row: Row): SavedDestination {
  return {
    id: row.id,
    cityId: row.city.id,
    cityName: row.city.name,
    country: row.city.country,
    imageUrl: row.city.imageUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export const savedDestinationsService = {
  async list(userId: number): Promise<SavedDestination[]> {
    const rows = await prisma.savedDestination.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        city: { select: { id: true, name: true, country: true, imageUrl: true } },
      },
    });
    return rows.map(toResponse);
  },

  async add(userId: number, cityId: number): Promise<SavedDestination> {
    const city = await prisma.city.findUnique({ where: { id: cityId }, select: { id: true } });
    if (!city) throw new BadRequest("City not found");

    const existing = await prisma.savedDestination.findUnique({
      where: { userId_cityId: { userId, cityId } },
      select: {
        id: true,
        createdAt: true,
        city: { select: { id: true, name: true, country: true, imageUrl: true } },
      },
    });
    if (existing) return toResponse(existing);

    const created = await prisma.savedDestination.create({
      data: { userId, cityId },
      select: {
        id: true,
        createdAt: true,
        city: { select: { id: true, name: true, country: true, imageUrl: true } },
      },
    });
    return toResponse(created);
  },

  async remove(userId: number, cityId: number): Promise<void> {
    const existing = await prisma.savedDestination.findUnique({
      where: { userId_cityId: { userId, cityId } },
      select: { id: true },
    });
    if (!existing) throw new NotFound("Saved destination not found");
    await prisma.savedDestination.delete({ where: { id: existing.id } });
  },
};
