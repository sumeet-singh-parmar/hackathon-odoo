import type { Budget } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { BarTrend } from "@/components/charts/BarTrend";
import { formatMoney } from "@/lib/format";

export function BudgetByDay({ budget }: { budget: Budget }) {
  const data = budget.byDay.map((d) => ({ label: d.date, value: d.amount }));
  return (
    <Card className="p-5">
      <p className="font-display text-lg font-bold text-text">Day by day</p>
      <p className="text-sm text-muted">Daily spending across the trip</p>
      <div className="mt-4">
        <BarTrend data={data} formatValue={(v) => formatMoney(v, budget.currency)} />
      </div>
    </Card>
  );
}
