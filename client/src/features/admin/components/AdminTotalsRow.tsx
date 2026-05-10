import { Users, Map, Globe2, MapPin, Receipt, Sparkles } from "lucide-react";
import type { AdminStatsResponse } from "@hackathon/shared";
import { StatCard } from "@/components/data-display/StatCard";
import { formatMoney } from "@/lib/format";

interface Props {
  totals: AdminStatsResponse["totals"];
  averageTripBudget: number;
  averageTripDays: number;
}

export function AdminTotalsRow({ totals, averageTripBudget, averageTripDays }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Travellers"
        value={totals.users.toLocaleString()}
        hint="Registered accounts"
        icon={<Users className="h-5 w-5" strokeWidth={2.25} />}
        tone="primary"
      />
      <StatCard
        label="Trips planned"
        value={totals.trips.toLocaleString()}
        hint={`${totals.publicTrips} public`}
        icon={<Map className="h-5 w-5" strokeWidth={2.25} />}
        tone="accent"
      />
      <StatCard
        label="Avg trip cost"
        value={formatMoney(averageTripBudget)}
        hint={`${averageTripDays} days on average`}
        icon={<Receipt className="h-5 w-5" strokeWidth={2.25} />}
        tone="gold"
      />
      <StatCard
        label="Activities pinned"
        value={totals.pinnedActivities.toLocaleString()}
        hint={`${totals.stops.toLocaleString()} stops, ${totals.expenses.toLocaleString()} expenses`}
        icon={<Sparkles className="h-5 w-5" strokeWidth={2.25} />}
        tone="success"
      />
      <span className="hidden">
        <Globe2 className="h-0 w-0" />
        <MapPin className="h-0 w-0" />
      </span>
    </div>
  );
}
