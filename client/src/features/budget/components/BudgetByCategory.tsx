import type { Budget } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { PieBreakdown } from "@/components/charts/PieBreakdown";
import { formatMoney } from "@/lib/format";

const labels = {
  TRANSPORT: "Transport",
  STAY: "Stay",
  FOOD: "Food",
  ACTIVITIES: "Activities",
  MISC: "Misc",
} as const;

export function BudgetByCategory({ budget }: { budget: Budget }) {
  const data = budget.byCategory.map((b) => ({ name: labels[b.category], value: b.amount }));
  return (
    <Card className="p-5">
      <p className="font-display text-lg font-bold text-text">Where your money goes</p>
      <p className="text-sm text-muted">Breakdown by category</p>
      <div className="mt-4">
        <PieBreakdown data={data} formatValue={(v) => formatMoney(v, budget.currency)} />
      </div>
    </Card>
  );
}
