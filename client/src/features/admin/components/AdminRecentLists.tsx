import type { AdminStatsResponse } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { formatRelative } from "@/lib/format";

interface Props {
  recentUsers: AdminStatsResponse["recentUsers"];
  recentTrips: AdminStatsResponse["recentTrips"];
}

export function AdminRecentLists({ recentUsers, recentTrips }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <p className="font-display text-lg font-bold text-text">Newest travellers</p>
        <p className="text-sm text-muted">Most recent signups.</p>
        {recentUsers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No users yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold text-text">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-muted">
                  {formatRelative(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <p className="font-display text-lg font-bold text-text">Latest trips</p>
        <p className="text-sm text-muted">Recently created itineraries.</p>
        {recentTrips.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No trips yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {recentTrips.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <p className="truncate font-display font-semibold text-text">{t.name}</p>
                <span className="flex-shrink-0 text-xs text-muted">
                  {formatRelative(t.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
