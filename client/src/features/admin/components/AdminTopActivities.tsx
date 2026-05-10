import type { AdminStatsResponse } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { BarTrend } from "@/components/charts/BarTrend";

interface Props {
  activities: AdminStatsResponse["topActivities"];
}

export function AdminTopActivities({ activities }: Props) {
  const data = activities.map((a) => ({ label: trim(a.name), value: a.useCount }));
  return (
    <Card className="p-5">
      <p className="font-display text-lg font-bold text-text">Top activities</p>
      <p className="text-sm text-muted">Activities pinned to the most stops.</p>
      <div className="mt-4">
        {data.length > 0 ? (
          <BarTrend data={data} formatValue={(v) => `${v}×`} />
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-6 text-center text-sm text-muted">
            No activities pinned yet.
          </p>
        )}
      </div>
    </Card>
  );
}

function trim(name: string): string {
  return name.length > 22 ? `${name.slice(0, 20)}…` : name;
}
