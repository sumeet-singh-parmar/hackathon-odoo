import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be yyyy-mm-dd");

export const ExpenseCategoryValues = ["TRANSPORT", "STAY", "ACTIVITIES", "MEALS"] as const;
export type ExpenseCategory = (typeof ExpenseCategoryValues)[number];

export const CreateExpenseSchema = z.object({
  category: z.enum(ExpenseCategoryValues),
  amount: z.number().min(0).max(999999),
  day: dateString.nullable().optional(),
  note: z.string().trim().max(200).nullable().optional(),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const UpdateExpenseSchema = z.object({
  category: z.enum(ExpenseCategoryValues).optional(),
  amount: z.number().min(0).max(999999).optional(),
  day: dateString.nullable().optional(),
  note: z.string().trim().max(200).nullable().optional(),
});
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

export interface ExpenseResponse {
  id: number;
  tripId: number;
  category: ExpenseCategory;
  amount: number;
  day: string | null;
  note: string | null;
  isAuto: boolean;
  createdAt: string;
  updatedAt: string;
}
