import type { ExpenseCategory } from "./expense";

export type BudgetByCategory = Record<ExpenseCategory, number>;

export interface BudgetByDay {
  day: string;
  total: number;
}

export interface BudgetBreakdown {
  total: number;
  tripDays: number;
  averagePerDay: number;
  byCategory: BudgetByCategory;
  byDay: BudgetByDay[];
  overBudgetDays: string[];
}

// client-side compat shapes for dummy data + UI components.
export interface BudgetCategoryBreakdown {
  category: "TRANSPORT" | "STAY" | "FOOD" | "ACTIVITIES" | "MISC";
  amount: number;
}

export interface BudgetDayBreakdown {
  date: string;
  amount: number;
}

export interface Budget {
  tripId: number;
  currency: string;
  total: number;
  budgetLimit: number | null;
  perDayAverage: number;
  byCategory: BudgetCategoryBreakdown[];
  byDay: BudgetDayBreakdown[];
  overBudgetDays: string[];
}
