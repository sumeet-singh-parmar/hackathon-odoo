import { Prisma } from "@prisma/client";
import type {
  BudgetBreakdown,
  BudgetByCategory,
  CreateExpenseInput,
  ExpenseCategory,
  ExpenseResponse,
  UpdateExpenseInput,
} from "@hackathon/shared";
import { prisma } from "@/core/prisma";
import { BadRequest, Forbidden, NotFound } from "@/core/errors";

const expenseSelect = {
  id: true,
  tripId: true,
  category: true,
  amount: true,
  day: true,
  note: true,
  isAuto: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ExpenseSelect;

type ExpenseRow = Prisma.ExpenseGetPayload<{ select: typeof expenseSelect }>;

function dayString(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

function toExpense(row: ExpenseRow): ExpenseResponse {
  return {
    id: row.id,
    tripId: row.tripId,
    category: row.category,
    amount: row.amount,
    day: dayString(row.day),
    note: row.note,
    isAuto: row.isAuto,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureTrip(userId: number, tripId: number) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, ownerId: true, startDate: true, endDate: true },
  });
  if (!trip) throw new NotFound("Trip not found");
  if (trip.ownerId !== userId) throw new Forbidden("Not your trip");
  return trip;
}

async function ensureExpense(userId: number, expenseId: number) {
  const e = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: {
      id: true,
      tripId: true,
      isAuto: true,
      trip: { select: { ownerId: true, startDate: true, endDate: true } },
    },
  });
  if (!e) throw new NotFound("Expense not found");
  if (e.trip.ownerId !== userId) throw new Forbidden("Not your expense");
  return e;
}

export async function listExpenses(userId: number, tripId: number): Promise<ExpenseResponse[]> {
  await ensureTrip(userId, tripId);
  const rows = await prisma.expense.findMany({
    where: { tripId },
    orderBy: [{ day: "asc" }, { createdAt: "asc" }],
    select: expenseSelect,
  });
  return rows.map(toExpense);
}

export async function createExpense(
  userId: number,
  tripId: number,
  input: CreateExpenseInput,
): Promise<ExpenseResponse> {
  const trip = await ensureTrip(userId, tripId);
  if (input.day) {
    const day = new Date(input.day);
    if (day < trip.startDate || day > trip.endDate)
      throw new BadRequest("Expense day must be within trip dates");
  }
  const created = await prisma.expense.create({
    data: {
      tripId,
      category: input.category,
      amount: input.amount,
      day: input.day ? new Date(input.day) : null,
      note: input.note ?? null,
      isAuto: false,
    },
    select: expenseSelect,
  });
  return toExpense(created);
}

export async function updateExpense(
  userId: number,
  id: number,
  input: UpdateExpenseInput,
): Promise<ExpenseResponse> {
  const existing = await ensureExpense(userId, id);
  if (existing.isAuto)
    throw new BadRequest(
      "Auto-generated expenses can't be edited directly. Re-run auto-estimate, or add a manual expense to override.",
    );
  if (input.day !== undefined && input.day !== null) {
    const day = new Date(input.day);
    if (day < existing.trip.startDate || day > existing.trip.endDate)
      throw new BadRequest("Expense day must be within trip dates");
  }
  const data: Prisma.ExpenseUpdateInput = {};
  if (input.category !== undefined) data.category = input.category;
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.day !== undefined) data.day = input.day ? new Date(input.day) : null;
  if (input.note !== undefined) data.note = input.note;
  const updated = await prisma.expense.update({ where: { id }, data, select: expenseSelect });
  return toExpense(updated);
}

export async function removeExpense(userId: number, id: number): Promise<void> {
  const existing = await ensureExpense(userId, id);
  if (existing.isAuto)
    throw new BadRequest(
      "Auto-generated expenses can't be deleted directly. Re-run auto-estimate to regenerate them.",
    );
  await prisma.expense.delete({ where: { id } });
}

const HOTEL_PER_DAY = 80;
const MEALS_PER_DAY = 40;
const TRANSPORT_PER_TRANSITION = 100;
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function emptyByCategory(): BudgetByCategory {
  return { TRANSPORT: 0, STAY: 0, ACTIVITIES: 0, MEALS: 0 };
}

function days(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / ONE_DAY_MS) + 1;
}

export async function breakdown(userId: number, tripId: number): Promise<BudgetBreakdown> {
  const trip = await ensureTrip(userId, tripId);
  const expenses = await prisma.expense.findMany({
    where: { tripId },
    select: { category: true, amount: true, day: true },
  });

  const byCategory = emptyByCategory();
  const byDayMap = new Map<string, number>();
  let total = 0;

  for (const e of expenses) {
    byCategory[e.category as ExpenseCategory] += e.amount;
    total += e.amount;
    if (e.day) {
      const day = e.day.toISOString().slice(0, 10);
      byDayMap.set(day, (byDayMap.get(day) ?? 0) + e.amount);
    }
  }

  const tripDays = days(trip.startDate, trip.endDate);
  const averagePerDay = tripDays > 0 ? total / tripDays : 0;

  const byDay = Array.from(byDayMap.entries())
    .map(([day, dayTotal]) => ({ day, total: dayTotal }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const overThreshold = averagePerDay * 1.5;
  const overBudgetDays = byDay
    .filter((d) => d.total > overThreshold && overThreshold > 0)
    .map((d) => d.day);

  return {
    total: Math.round(total * 100) / 100,
    tripDays,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
    byCategory,
    byDay,
    overBudgetDays,
  };
}

export async function autoEstimate(userId: number, tripId: number): Promise<BudgetBreakdown> {
  await ensureTrip(userId, tripId);

  const stops = await prisma.stop.findMany({
    where: { tripId },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      city: { select: { costIndex: true } },
      activities: {
        select: { customCost: true, activity: { select: { baseCost: true } } },
      },
    },
  });

  const newRows: Prisma.ExpenseCreateManyInput[] = [];
  for (const stop of stops) {
    const d = days(stop.startDate, stop.endDate);
    const stayPerDay = Math.round(HOTEL_PER_DAY * stop.city.costIndex);
    const mealsPerDay = Math.round(MEALS_PER_DAY * stop.city.costIndex);
    const transport = Math.round(TRANSPORT_PER_TRANSITION * stop.city.costIndex);
    const activities = stop.activities.reduce(
      (acc, a) => acc + (a.customCost ?? a.activity.baseCost),
      0,
    );

    newRows.push({
      tripId,
      category: "TRANSPORT",
      amount: transport,
      day: stop.startDate,
      note: "Auto-estimated transport",
      isAuto: true,
    });
    for (let i = 0; i < d; i++) {
      const day = new Date(stop.startDate.getTime() + i * ONE_DAY_MS);
      newRows.push({
        tripId, category: "STAY", amount: stayPerDay, day, note: "Auto-estimated stay", isAuto: true,
      });
      newRows.push({
        tripId, category: "MEALS", amount: mealsPerDay, day, note: "Auto-estimated meals", isAuto: true,
      });
    }
    if (activities > 0) {
      newRows.push({
        tripId,
        category: "ACTIVITIES",
        amount: Math.round(activities),
        day: stop.startDate,
        note: "Auto-estimated activities",
        isAuto: true,
      });
    }
  }

  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { tripId, isAuto: true } }),
    prisma.expense.createMany({ data: newRows }),
  ]);

  return breakdown(userId, tripId);
}
