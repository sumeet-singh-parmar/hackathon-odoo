import type {
  Budget,
  BudgetBreakdown,
  BudgetCategoryBreakdown,
  ExpenseCategory,
} from "@hackathon/shared";
import { api } from "@/lib/api";

const CATEGORY_LABELS: Record<ExpenseCategory, BudgetCategoryBreakdown["category"]> = {
  TRANSPORT: "TRANSPORT",
  STAY: "STAY",
  ACTIVITIES: "ACTIVITIES",
  MEALS: "FOOD",
};

function formatDay(yyyyMmDd: string): string {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toClient(tripId: number, b: BudgetBreakdown, currency = "USD"): Budget {
  const byCategory: BudgetCategoryBreakdown[] = (Object.keys(b.byCategory) as ExpenseCategory[])
    .filter((k) => b.byCategory[k] > 0)
    .map((k) => ({ category: CATEGORY_LABELS[k], amount: b.byCategory[k] }));

  return {
    tripId,
    currency,
    total: b.total,
    budgetLimit: null,
    perDayAverage: b.averagePerDay,
    byCategory,
    byDay: b.byDay.map((d) => ({ date: formatDay(d.day), amount: d.total })),
    overBudgetDays: b.overBudgetDays.map(formatDay),
  };
}

export async function getBudget(tripId: number): Promise<Budget> {
  const breakdown = await api<BudgetBreakdown>(`/api/trips/${tripId}/budget`);
  return toClient(tripId, breakdown);
}

export async function autoEstimate(tripId: number): Promise<Budget> {
  const breakdown = await api<BudgetBreakdown>(`/api/trips/${tripId}/budget/auto-estimate`, {
    method: "POST",
  });
  return toClient(tripId, breakdown);
}
