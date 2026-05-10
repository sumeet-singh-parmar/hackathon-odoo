import { Users, UserPlus, Activity } from "lucide-react";
import type { AdminStats } from "@hackathon/shared";
import { StatCard } from "@/components/data-display/StatCard";

export function AdminStatsRow({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total users"
        value={stats.totalUsers.toLocaleString()}
        icon={<Users className="h-5 w-5" strokeWidth={2.25} />}
        tone="primary"
      />
      <StatCard
        label="New (7 days)"
        value={`+${stats.newUsers7d}`}
        icon={<UserPlus className="h-5 w-5" strokeWidth={2.25} />}
        tone="accent"
      />
      <StatCard
        label="Active (7 days)"
        value={stats.activeUsers7d.toLocaleString()}
        icon={<Activity className="h-5 w-5" strokeWidth={2.25} />}
        tone="success"
      />
    </div>
  );
}
