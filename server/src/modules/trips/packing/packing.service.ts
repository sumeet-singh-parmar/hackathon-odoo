import { Prisma } from "@prisma/client";
import type {
  CreatePackingItemInput,
  PackingItemResponse,
  UpdatePackingItemInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { Forbidden, NotFound } from "@/core/errors";

const packingSelect = {
  id: true,
  tripId: true,
  name: true,
  category: true,
  isPacked: true,
  createdAt: true,
} satisfies Prisma.PackingItemSelect;

type Row = Prisma.PackingItemGetPayload<{ select: typeof packingSelect }>;

function toResponse(row: Row): PackingItemResponse {
  return {
    id: row.id,
    tripId: row.tripId,
    name: row.name,
    category: row.category,
    isPacked: row.isPacked,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ensureTrip(userId: number, tripId: number) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
}

async function ensureItem(userId: number, id: number) {
  const item = await prisma.packingItem.findUnique({
    where: { id },
    select: { id: true, trip: { select: { ownerId: true } } },
  });
  if (!item) throw new NotFound("Packing item not found");
  if (item.trip.ownerId !== userId) throw new Forbidden("Not your packing item");
}

export async function list(userId: number, tripId: number): Promise<PackingItemResponse[]> {
  await ensureTrip(userId, tripId);
  const rows = await prisma.packingItem.findMany({
    where: { tripId },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    select: packingSelect,
  });
  return rows.map(toResponse);
}

export async function create(
  userId: number,
  tripId: number,
  input: CreatePackingItemInput,
): Promise<PackingItemResponse> {
  await ensureTrip(userId, tripId);
  const created = await prisma.packingItem.create({
    data: { tripId, name: input.name, category: input.category, isPacked: input.isPacked ?? false },
    select: packingSelect,
  });
  return toResponse(created);
}

export async function update(
  userId: number,
  id: number,
  input: UpdatePackingItemInput,
): Promise<PackingItemResponse> {
  await ensureItem(userId, id);
  const data: Prisma.PackingItemUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.category !== undefined) data.category = input.category;
  if (input.isPacked !== undefined) data.isPacked = input.isPacked;
  const updated = await prisma.packingItem.update({ where: { id }, data, select: packingSelect });
  return toResponse(updated);
}

export async function remove(userId: number, id: number): Promise<void> {
  await ensureItem(userId, id);
  await prisma.packingItem.delete({ where: { id } });
}

export async function resetAll(userId: number, tripId: number): Promise<PackingItemResponse[]> {
  await ensureTrip(userId, tripId);
  await prisma.packingItem.updateMany({
    where: { tripId, isPacked: true },
    data: { isPacked: false },
  });
  return list(userId, tripId);
}
