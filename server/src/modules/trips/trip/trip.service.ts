import { Prisma } from "@prisma/client";
import type {
  CreateTripInput,
  ListTripsQuery,
  ListTripsResponse,
  Trip,
  TripDetail,
  TripSummary,
  UpdateTripInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, Forbidden, NotFound } from "@/core/errors";
import { generateSlug } from "@/core/slug";
import { stopSelect, toStopResponse } from "@/modules/trips/stop/stop.service";

const summarySelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  coverPhotoUrl: true,
  isPublic: true,
  shareSlug: true,
  status: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { stops: true } },
  expenses: { select: { amount: true } },
} satisfies Prisma.TripSelect;

type SummaryRow = Prisma.TripGetPayload<{ select: typeof summarySelect }>;

const detailSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  coverPhotoUrl: true,
  isPublic: true,
  shareSlug: true,
  status: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  expenses: { select: { amount: true } },
  stops: { orderBy: { orderIndex: "asc" }, select: stopSelect },
} satisfies Prisma.TripSelect;

type DetailRow = Prisma.TripGetPayload<{ select: typeof detailSelect }>;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toSummary(trip: SummaryRow): TripSummary {
  const totalBudget = trip.expenses.reduce((acc, e) => acc + e.amount, 0);
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: formatDate(trip.startDate),
    endDate: formatDate(trip.endDate),
    coverPhotoUrl: trip.coverPhotoUrl,
    isPublic: trip.isPublic,
    shareSlug: trip.shareSlug,
    status: trip.status,
    currency: trip.currency,
    stopCount: trip._count.stops,
    totalBudget,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}

function toClientTrip(row: SummaryRow): Trip {
  const totalBudget = row.expenses.reduce((acc, e) => acc + e.amount, 0);
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    description: row.description,
    startDate: formatDate(row.startDate),
    endDate: formatDate(row.endDate),
    coverUrl: row.coverPhotoUrl,
    budget: totalBudget > 0 ? totalBudget : null,
    currency: row.currency,
    visibility: row.isPublic ? "PUBLIC" : "PRIVATE",
    status: row.status,
    shareToken: row.shareSlug,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDetail(trip: DetailRow): TripDetail {
  const totalBudget = trip.expenses.reduce((acc, e) => acc + e.amount, 0);
  return {
    id: trip.id,
    ownerId: trip.ownerId,
    name: trip.name,
    description: trip.description,
    startDate: formatDate(trip.startDate),
    endDate: formatDate(trip.endDate),
    coverPhotoUrl: trip.coverPhotoUrl,
    isPublic: trip.isPublic,
    shareSlug: trip.shareSlug,
    status: trip.status,
    currency: trip.currency,
    totalBudget,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    stops: trip.stops.map(toStopResponse),
  };
}

export async function create(
  userId: number,
  input: CreateTripInput,
  coverPhotoUrl?: string | null,
): Promise<TripSummary> {
  const trip = await prisma.trip.create({
    data: {
      ownerId: userId,
      name: input.name,
      description: input.description ?? null,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      currency: input.currency,
      status: input.status,
      coverPhotoUrl: coverPhotoUrl ?? input.coverUrl ?? null,
      isPublic: input.visibility === "PUBLIC",
    },
    select: summarySelect,
  });
  return toSummary(trip);
}

export async function listFeatured(): Promise<Trip[]> {
  const rows = await prisma.trip.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: summarySelect,
  });
  return rows.map(toClientTrip);
}

export async function list(userId: number, query: ListTripsQuery): Promise<ListTripsResponse> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.trip.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: summarySelect,
    }),
    prisma.trip.count({ where: { ownerId: userId } }),
  ]);
  return { items: rows.map(toSummary), total, page, limit };
}

export async function getById(userId: number, id: number): Promise<TripDetail> {
  const trip = await prisma.trip.findUnique({ where: { id }, select: detailSelect });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  return toDetail(trip);
}

export async function update(
  userId: number,
  id: number,
  input: UpdateTripInput,
): Promise<TripSummary> {
  const existing = await prisma.trip.findUnique({
    where: { id },
    select: { ownerId: true, startDate: true, endDate: true },
  });
  if (!existing) throw new NotFound("Trip not found");
  if (existing.ownerId !== userId) throw new Forbidden("Not your trip");

  const newStart = input.startDate ? new Date(input.startDate) : existing.startDate;
  const newEnd = input.endDate ? new Date(input.endDate) : existing.endDate;
  if (newEnd < newStart) throw new BadRequest("endDate must be on or after startDate");

  const data: Prisma.TripUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
  if (input.endDate !== undefined) data.endDate = new Date(input.endDate);
  if (input.coverPhotoUrl !== undefined) data.coverPhotoUrl = input.coverPhotoUrl;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.status !== undefined) data.status = input.status;

  const updated = await prisma.trip.update({ where: { id }, data, select: summarySelect });
  return toSummary(updated);
}

export async function remove(userId: number, id: number): Promise<void> {
  const trip = await prisma.trip.findUnique({ where: { id }, select: { ownerId: true } });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  await prisma.trip.delete({ where: { id } });
}

async function generateUniqueSlug(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = generateSlug();
    const taken = await prisma.trip.findUnique({ where: { shareSlug: slug }, select: { id: true } });
    if (!taken) return slug;
  }
  throw new Error("Could not generate unique share slug");
}

export async function share(userId: number, id: number): Promise<TripSummary> {
  const trip = await prisma.trip.findUnique({ where: { id }, select: { ownerId: true, shareSlug: true } });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  const slug = trip.shareSlug ?? (await generateUniqueSlug());
  const updated = await prisma.trip.update({
    where: { id },
    data: { isPublic: true, shareSlug: slug },
    select: summarySelect,
  });
  return toSummary(updated);
}

export async function unshare(userId: number, id: number): Promise<TripSummary> {
  const trip = await prisma.trip.findUnique({ where: { id }, select: { ownerId: true } });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  const updated = await prisma.trip.update({
    where: { id },
    data: { isPublic: false, shareSlug: null },
    select: summarySelect,
  });
  return toSummary(updated);
}

export async function getPublicBySlug(slug: string): Promise<TripDetail> {
  const trip = await prisma.trip.findUnique({ where: { shareSlug: slug }, select: detailSelect });
  if (!trip || !trip.isPublic) throw new NotFound("Public trip not found");
  return toDetail(trip);
}

export async function copyFromSlug(userId: number, slug: string): Promise<TripDetail> {
  const source = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    select: {
      id: true,
      isPublic: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      coverPhotoUrl: true,
      currency: true,
      stops: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          cityId: true,
          startDate: true,
          endDate: true,
          orderIndex: true,
          activities: {
            orderBy: { createdAt: "asc" },
            select: { activityId: true, scheduledTime: true, customCost: true, notes: true },
          },
        },
      },
      expenses: { select: { category: true, amount: true, day: true, note: true, isAuto: true } },
      packingItems: { select: { name: true, category: true } },
      notes: { select: { stopId: true, text: true } },
    },
  });
  if (!source || !source.isPublic) throw new NotFound("Public trip not found");

  const newTripId = await prisma.$transaction(async (tx) => {
    const newTrip = await tx.trip.create({
      data: {
        ownerId: userId,
        name: `${source.name} (copy)`,
        description: source.description,
        startDate: source.startDate,
        endDate: source.endDate,
        coverPhotoUrl: source.coverPhotoUrl,
        currency: source.currency,
        status: "DRAFT",
      },
      select: { id: true },
    });

    const stopIdMap = new Map<number, number>();
    for (const sourceStop of source.stops) {
      const newStop = await tx.stop.create({
        data: {
          tripId: newTrip.id,
          cityId: sourceStop.cityId,
          startDate: sourceStop.startDate,
          endDate: sourceStop.endDate,
          orderIndex: sourceStop.orderIndex,
        },
        select: { id: true },
      });
      stopIdMap.set(sourceStop.id, newStop.id);
      if (sourceStop.activities.length > 0) {
        await tx.tripActivity.createMany({
          data: sourceStop.activities.map((a) => ({
            stopId: newStop.id,
            activityId: a.activityId,
            scheduledTime: a.scheduledTime,
            customCost: a.customCost,
            notes: a.notes,
          })),
        });
      }
    }

    if (source.expenses.length > 0) {
      await tx.expense.createMany({
        data: source.expenses.map((e) => ({
          tripId: newTrip.id,
          category: e.category,
          amount: e.amount,
          day: e.day,
          note: e.note,
          isAuto: e.isAuto,
        })),
      });
    }

    if (source.packingItems.length > 0) {
      await tx.packingItem.createMany({
        data: source.packingItems.map((p) => ({
          tripId: newTrip.id,
          name: p.name,
          category: p.category,
          isPacked: false,
        })),
      });
    }

    if (source.notes.length > 0) {
      await tx.tripNote.createMany({
        data: source.notes.map((n) => ({
          tripId: newTrip.id,
          stopId: n.stopId ? (stopIdMap.get(n.stopId) ?? null) : null,
          text: n.text,
        })),
      });
    }

    return newTrip.id;
  });

  return getById(userId, newTripId);
}
