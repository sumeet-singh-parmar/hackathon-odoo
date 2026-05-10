import { Prisma } from "@prisma/client";
import type {
  CreateStopInput,
  ReorderStopsInput,
  StopResponse,
  UpdateStopInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, Forbidden, NotFound } from "@/core/errors";

export const stopSelect = {
  id: true,
  tripId: true,
  cityId: true,
  startDate: true,
  endDate: true,
  orderIndex: true,
  createdAt: true,
  city: { select: { id: true, name: true, country: true, region: true } },
  activities: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      stopId: true,
      activityId: true,
      scheduledTime: true,
      customCost: true,
      notes: true,
      createdAt: true,
      activity: {
        select: {
          id: true,
          cityId: true,
          name: true,
          type: true,
          baseCost: true,
          durationHours: true,
          description: true,
        },
      },
    },
  },
} satisfies Prisma.StopSelect;

type StopRow = Prisma.StopGetPayload<{ select: typeof stopSelect }>;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function toStopResponse(stop: StopRow): StopResponse {
  return {
    id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId,
    city: stop.city,
    startDate: formatDate(stop.startDate),
    endDate: formatDate(stop.endDate),
    orderIndex: stop.orderIndex,
    createdAt: stop.createdAt.toISOString(),
    activities: stop.activities.map((a) => ({
      id: a.id,
      stopId: a.stopId,
      activityId: a.activityId,
      activity: a.activity,
      scheduledTime: a.scheduledTime ? a.scheduledTime.toISOString() : null,
      customCost: a.customCost,
      notes: a.notes,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

async function ensureTripOwnership(userId: number, tripId: number) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, ownerId: true, startDate: true, endDate: true },
  });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  return trip;
}

async function ensureStopOwnership(userId: number, stopId: number) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    select: {
      id: true,
      tripId: true,
      trip: { select: { ownerId: true, startDate: true, endDate: true } },
    },
  });
  if (!stop) throw new NotFound("Stop not found");
  if (stop.trip.ownerId !== userId) throw new Forbidden("Not your stop");
  return stop;
}

async function checkOverlap(tripId: number, start: Date, end: Date, excludeStopId?: number) {
  const overlap = await prisma.stop.findFirst({
    where: {
      tripId,
      startDate: { lte: end },
      endDate: { gte: start },
      ...(excludeStopId ? { id: { not: excludeStopId } } : {}),
    },
    select: { id: true },
  });
  if (overlap) throw new BadRequest("Stop dates overlap with another stop in this trip");
}

export async function create(
  userId: number,
  tripId: number,
  input: CreateStopInput,
): Promise<StopResponse> {
  const trip = await ensureTripOwnership(userId, tripId);
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (start < trip.startDate || end > trip.endDate)
    throw new BadRequest("Stop dates must be within trip dates");
  await checkOverlap(tripId, start, end);

  const city = await prisma.city.findUnique({ where: { id: input.cityId }, select: { id: true } });
  if (!city) throw new BadRequest("City does not exist");

  const last = await prisma.stop.findFirst({
    where: { tripId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  const orderIndex = last ? last.orderIndex + 1 : 0;

  const stop = await prisma.stop.create({
    data: { tripId, cityId: input.cityId, startDate: start, endDate: end, orderIndex },
    select: stopSelect,
  });
  return toStopResponse(stop);
}

export async function update(
  userId: number,
  stopId: number,
  input: UpdateStopInput,
): Promise<StopResponse> {
  const stop = await ensureStopOwnership(userId, stopId);
  const newStartRaw = input.startDate ? new Date(input.startDate) : null;
  const newEndRaw = input.endDate ? new Date(input.endDate) : null;

  const existing = await prisma.stop.findUnique({
    where: { id: stopId },
    select: { startDate: true, endDate: true },
  });
  if (!existing) throw new NotFound("Stop not found");

  const effStart = newStartRaw ?? existing.startDate;
  const effEnd = newEndRaw ?? existing.endDate;
  if (effEnd < effStart) throw new BadRequest("endDate must be on or after startDate");
  if (effStart < stop.trip.startDate || effEnd > stop.trip.endDate)
    throw new BadRequest("Stop dates must be within trip dates");
  if (newStartRaw || newEndRaw) await checkOverlap(stop.tripId, effStart, effEnd, stopId);

  if (input.cityId !== undefined) {
    const city = await prisma.city.findUnique({
      where: { id: input.cityId },
      select: { id: true },
    });
    if (!city) throw new BadRequest("City does not exist");
  }

  const data: Prisma.StopUpdateInput = {};
  if (input.cityId !== undefined) data.city = { connect: { id: input.cityId } };
  if (newStartRaw) data.startDate = newStartRaw;
  if (newEndRaw) data.endDate = newEndRaw;

  const updated = await prisma.stop.update({ where: { id: stopId }, data, select: stopSelect });
  return toStopResponse(updated);
}

export async function remove(userId: number, stopId: number): Promise<void> {
  await ensureStopOwnership(userId, stopId);
  await prisma.stop.delete({ where: { id: stopId } });
}

export async function reorder(
  userId: number,
  tripId: number,
  input: ReorderStopsInput,
): Promise<StopResponse[]> {
  await ensureTripOwnership(userId, tripId);
  const existing = await prisma.stop.findMany({ where: { tripId }, select: { id: true } });

  if (input.stops.length !== existing.length)
    throw new BadRequest("Reorder list must include every stop in the trip");

  const existingIds = new Set(existing.map((s) => s.id));
  const inputIds = new Set<number>();
  for (const s of input.stops) {
    if (!existingIds.has(s.stopId))
      throw new BadRequest("Reorder list contains a stop not in this trip");
    if (inputIds.has(s.stopId)) throw new BadRequest("Duplicate stopId in reorder list");
    inputIds.add(s.stopId);
  }
  const sortedIndices = input.stops.map((s) => s.orderIndex).sort((a, b) => a - b);
  for (let i = 0; i < sortedIndices.length; i++) {
    if (sortedIndices[i] !== i)
      throw new BadRequest("orderIndex values must be 0..n-1 with no gaps or duplicates");
  }

  await prisma.$transaction(async (tx) => {
    for (const s of input.stops)
      await tx.stop.update({ where: { id: s.stopId }, data: { orderIndex: -s.stopId } });
    for (const s of input.stops)
      await tx.stop.update({ where: { id: s.stopId }, data: { orderIndex: s.orderIndex } });
  });

  const updated = await prisma.stop.findMany({
    where: { tripId },
    orderBy: { orderIndex: "asc" },
    select: stopSelect,
  });
  return updated.map(toStopResponse);
}
