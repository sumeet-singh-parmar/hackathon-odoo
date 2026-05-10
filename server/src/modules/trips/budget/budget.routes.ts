import { Router } from "express";
import { CreateExpenseSchema, UpdateExpenseSchema } from "@hackathon/shared";
import { requireAuth } from "@/modules/auth/middleware/require-auth";
import { validateBody } from "@/core/middleware/validate";
import { BadRequest } from "@/core/errors";
import * as budget from "@/modules/trips/budget/budget.service";

function parseId(raw: unknown, label: string): number {
  if (typeof raw !== "string") throw new BadRequest(`Invalid ${label}`);
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequest(`Invalid ${label}`);
  return id;
}

// Mounted at /api/trips/:tripId/budget
export const budgetRouter = Router({ mergeParams: true });
budgetRouter.use(requireAuth);

budgetRouter.get("/", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await budget.breakdown(req.userId!, tripId));
  } catch (err) { next(err); }
});

budgetRouter.post("/auto-estimate", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await budget.autoEstimate(req.userId!, tripId));
  } catch (err) { next(err); }
});

budgetRouter.get("/expenses", async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.json(await budget.listExpenses(req.userId!, tripId));
  } catch (err) { next(err); }
});

budgetRouter.post("/expenses", validateBody(CreateExpenseSchema), async (req, res, next) => {
  try {
    const tripId = parseId((req.params as Record<string, unknown>).tripId, "trip id");
    res.status(201).json(await budget.createExpense(req.userId!, tripId, req.body));
  } catch (err) { next(err); }
});

// Mounted at /api/expenses
export const expenseRouter = Router();
expenseRouter.use(requireAuth);

expenseRouter.patch("/:id", validateBody(UpdateExpenseSchema), async (req, res, next) => {
  try {
    res.json(await budget.updateExpense(req.userId!, parseId(req.params.id, "expense id"), req.body));
  } catch (err) { next(err); }
});

expenseRouter.delete("/:id", async (req, res, next) => {
  try {
    await budget.removeExpense(req.userId!, parseId(req.params.id, "expense id"));
    res.status(204).end();
  } catch (err) { next(err); }
});
