import { Prisma } from "@prisma/client";
import type {
  PinActivityInput,
  TripActivityResponse,
  UpdateTripActivityInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, Forbidden, NotFound } from "@/core/errors";

const tripActivitySelect = {
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
} satisfies Prisma.TripActivitySelect;

type Row = Prisma.TripActivityGetPayload<{ select: typeof tripActivitySelect }>;

function toResponse(row: Row): TripActivityResponse {
  return {
    id: row.id,
    stopId: row.stopId,
    activityId: row.activityId,
    activity: row.activity,
    scheduledTime: row.scheduledTime ? row.scheduledTime.toISOString() : null,
    customCost: row.customCost,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function pin(
  userId: number,
  stopId: number,
  input: PinActivityInput,
): Promise<TripActivityResponse> {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    select: { id: true, cityId: true, trip: { select: { ownerId: true } } },
  });
  if (!stop) throw new NotFound("Stop not found");
  if (stop.trip.ownerId !== userId) throw new Forbidden("Not your stop");

  const activity = await prisma.activity.findUnique({
    where: { id: input.activityId },
    select: { cityId: true },
  });
  if (!activity) throw new BadRequest("Activity does not exist");
  if (activity.cityId !== stop.cityId)
    throw new BadRequest("Activity does not belong to this stop's city");

  const created = await prisma.tripActivity.create({
    data: {
      stopId,
      activityId: input.activityId,
      scheduledTime: input.scheduledTime ? new Date(input.scheduledTime) : null,
      customCost: input.customCost ?? null,
      notes: input.notes ?? null,
    },
    select: tripActivitySelect,
  });
  return toResponse(created);
}

export async function update(
  userId: number,
  id: number,
  input: UpdateTripActivityInput,
): Promise<TripActivityResponse> {
  const existing = await prisma.tripActivity.findUnique({
    where: { id },
    select: { stop: { select: { trip: { select: { ownerId: true } } } } },
  });
  if (!existing) throw new NotFound("Trip activity not found");
  if (existing.stop.trip.ownerId !== userId) throw new Forbidden("Not your trip activity");

  const data: Prisma.TripActivityUpdateInput = {};
  if (input.scheduledTime !== undefined)
    data.scheduledTime = input.scheduledTime ? new Date(input.scheduledTime) : null;
  if (input.customCost !== undefined) data.customCost = input.customCost;
  if (input.notes !== undefined) data.notes = input.notes;

  const updated = await prisma.tripActivity.update({
    where: { id },
    data,
    select: tripActivitySelect,
  });
  return toResponse(updated);
}

export async function unpin(userId: number, id: number): Promise<void> {
  const existing = await prisma.tripActivity.findUnique({
    where: { id },
    select: { stop: { select: { trip: { select: { ownerId: true } } } } },
  });
  if (!existing) throw new NotFound("Trip activity not found");
  if (existing.stop.trip.ownerId !== userId) throw new Forbidden("Not your trip activity");
  await prisma.tripActivity.delete({ where: { id } });
}
