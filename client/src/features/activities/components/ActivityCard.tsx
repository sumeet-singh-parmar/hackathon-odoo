import { Clock, Wallet } from "lucide-react";
import type { ActivityResponse } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

interface ActivityCardProps {
  activity: ActivityResponse;
  cityLabel?: string;
  onSelect?: (activity: ActivityResponse) => void;
}

const typeTone: Record<ActivityResponse["type"], React.ComponentProps<typeof Badge>["tone"]> = {
  SIGHTSEEING: "primary",
  FOOD: "gold",
  ADVENTURE: "success",
  NIGHTLIFE: "danger",
  CULTURE: "accent",
  NATURE: "success",
};

export function ActivityCard({ activity, cityLabel, onSelect }: ActivityCardProps) {
  const inner = (
    <Card
      className={cn(
        "flex h-full flex-col gap-3 p-5",
        onSelect && "transition-colors hover:border-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-text">{activity.name}</h3>
          {cityLabel && <p className="text-xs text-muted">{cityLabel}</p>}
        </div>
        <Badge tone={typeTone[activity.type]} stamp>
          {activity.type.toLowerCase()}
        </Badge>
      </div>

      {activity.description && (
        <p className="line-clamp-3 flex-1 text-sm text-muted">{activity.description}</p>
      )}

      <div className="mt-auto flex items-center gap-3 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {activity.durationHours}h
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-display font-semibold text-text">
          <Wallet className="h-4 w-4 text-gold" />
          {activity.baseCost > 0 ? formatMoney(activity.baseCost) : "Free"}
        </span>
      </div>
    </Card>
  );

  if (!onSelect) return inner;

  return (
    <button
      type="button"
      onClick={() => onSelect(activity)}
      className="block h-full text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:-translate-y-0.5"
    >
      {inner}
    </button>
  );
}
