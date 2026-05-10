import type { AdminStatsResponse } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { BarTrend } from "@/components/charts/BarTrend";

interface Props {
  cities: AdminStatsResponse["topCities"];
}

export function AdminTopCities({ cities }: Props) {
  const data = cities.map((c) => ({ label: c.name, value: c.useCount }));
  return (
    <Card className="p-5">
      <p className="font-display text-lg font-bold text-text">Top cities</p>
      <p className="text-sm text-muted">Most-used cities across all stops.</p>
      <div className="mt-4">
        {data.length > 0 ? (
          <BarTrend data={data} formatValue={(v) => `${v}×`} />
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-6 text-center text-sm text-muted">
            No stops planned yet.
          </p>
        )}
      </div>
      {cities.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {cities.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <span>
                <span className="font-display font-semibold text-text">{c.name}</span>
                <span className="ml-1">· {c.country}</span>
              </span>
              <span className="font-display font-semibold text-text">{c.useCount}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
