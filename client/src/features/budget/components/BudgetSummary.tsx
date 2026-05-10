import { Wallet, TrendingDown, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import type { Budget } from "@hackathon/shared";
import { StatCard } from "@/components/data-display/StatCard";
import { formatMoney } from "@/lib/format";

interface BudgetSummaryProps {
  budget: Budget;
}

export function BudgetSummary({ budget }: BudgetSummaryProps) {
  const overBudget = budget.budgetLimit != null && budget.total > budget.budgetLimit;
  const remaining = budget.budgetLimit != null ? budget.budgetLimit - budget.total : null;
  const overDays = budget.overBudgetDays ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total spend"
          value={formatMoney(budget.total, budget.currency)}
          hint={
            budget.budgetLimit != null
              ? `of ${formatMoney(budget.budgetLimit, budget.currency)}`
              : undefined
          }
          icon={<Wallet className="h-5 w-5" strokeWidth={2.25} />}
          tone="primary"
        />
        <StatCard
          label="Per day"
          value={formatMoney(budget.perDayAverage, budget.currency)}
          icon={<Calendar className="h-5 w-5" strokeWidth={2.25} />}
          tone="accent"
        />
        <StatCard
          label={overBudget ? "Over budget" : "Remaining"}
          value={remaining != null ? formatMoney(Math.abs(remaining), budget.currency) : "—"}
          hint={budget.budgetLimit == null ? "no limit set" : undefined}
          icon={overBudget ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          tone={overBudget ? "gold" : "success"}
        />
      </div>

      {overDays.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border-2 border-warning/40 bg-warning/10 px-4 py-3"
        >
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
            <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="text-sm">
            <p className="font-display font-semibold text-text">
              {overDays.length} {overDays.length === 1 ? "day spikes" : "days spike"} above your daily average
            </p>
            <p className="text-muted">
              Heavy days: <span className="font-display font-semibold text-text">{overDays.join(", ")}</span>.
              Re-run auto-estimate or add a manual cap to plan around them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
