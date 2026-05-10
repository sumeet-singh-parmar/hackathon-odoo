import { Prisma } from "@prisma/client";
import type {
  CreateTripNoteInput,
  TripNoteResponse,
  UpdateTripNoteInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, Forbidden, NotFound } from "@/core/errors";

const noteSelect = {
  id: true,
  tripId: true,
  stopId: true,
  text: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TripNoteSelect;

type Row = Prisma.TripNoteGetPayload<{ select: typeof noteSelect }>;

function toResponse(row: Row): TripNoteResponse {
  return {
    id: row.id,
    tripId: row.tripId,
    stopId: row.stopId,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureTrip(userId: number, tripId: number) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
}

async function ensureNote(userId: number, id: number) {
  const note = await prisma.tripNote.findUnique({
    where: { id },
    select: { id: true, trip: { select: { ownerId: true } } },
  });
  if (!note) throw new NotFound("Note not found");
  if (note.trip.ownerId !== userId) throw new Forbidden("Not your note");
}

export async function list(userId: number, tripId: number): Promise<TripNoteResponse[]> {
  await ensureTrip(userId, tripId);
  const rows = await prisma.tripNote.findMany({
    where: { tripId },
    orderBy: [{ createdAt: "desc" }],
    select: noteSelect,
  });
  return rows.map(toResponse);
}

export async function create(
  userId: number,
  tripId: number,
  input: CreateTripNoteInput,
): Promise<TripNoteResponse> {
  await ensureTrip(userId, tripId);
  if (input.stopId) {
    const stop = await prisma.stop.findUnique({
      where: { id: input.stopId },
      select: { tripId: true },
    });
    if (!stop || stop.tripId !== tripId)
      throw new BadRequest("Stop does not belong to this trip");
  }
  const created = await prisma.tripNote.create({
    data: { tripId, stopId: input.stopId ?? null, text: input.text },
    select: noteSelect,
  });
  return toResponse(created);
}

export async function update(
  userId: number,
  id: number,
  input: UpdateTripNoteInput,
): Promise<TripNoteResponse> {
  await ensureNote(userId, id);
  const updated = await prisma.tripNote.update({
    where: { id },
    data: { text: input.text },
    select: noteSelect,
  });
  return toResponse(updated);
}

export async function remove(userId: number, id: number): Promise<void> {
  await ensureNote(userId, id);
  await prisma.tripNote.delete({ where: { id } });
}
