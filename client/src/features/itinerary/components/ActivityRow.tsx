import { Clock, Wallet, Trash2 } from "lucide-react";
import type { Activity } from "@hackathon/shared";
import { Badge } from "@/components/primitives/Badge";
import { formatMoney } from "@/lib/format";

interface ActivityRowProps {
  activity: Activity;
  currency?: string;
  onRemove?: (id: number) => void;
}

const typeLabels: Record<Activity["type"], string> = {
  SIGHTSEEING: "Sightseeing",
  FOOD: "Food",
  ADVENTURE: "Adventure",
  RELAX: "Relax",
  CULTURE: "Culture",
  NIGHTLIFE: "Nightlife",
  OTHER: "Other",
};

const typeTones: Record<Activity["type"], React.ComponentProps<typeof Badge>["tone"]> = {
  SIGHTSEEING: "primary",
  FOOD: "gold",
  ADVENTURE: "success",
  RELAX: "accent",
  CULTURE: "primary",
  NIGHTLIFE: "danger",
  OTHER: "neutral",
};

export function ActivityRow({ activity, currency = "USD", onRemove }: ActivityRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <Badge tone={typeTones[activity.type]}>{typeLabels[activity.type]}</Badge>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-text">{activity.name}</p>
        {activity.notes && <p className="truncate text-xs text-muted">{activity.notes}</p>}
      </div>
      {activity.durationMinutes != null && (
        <span className="hidden items-center gap-1 text-xs text-muted sm:inline-flex">
          <Clock className="h-3.5 w-3.5" />
          {Math.round(activity.durationMinutes / 60 * 10) / 10}h
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-sm font-display font-semibold text-text">
        <Wallet className="h-4 w-4 text-gold" />
        {formatMoney(activity.cost, currency)}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(activity.id)}
          aria-label={`Remove ${activity.name}`}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
