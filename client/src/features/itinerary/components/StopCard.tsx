import { useState } from "react";
import { Calendar, MapPin, Plane, Train, Bus, Car, X, Plus } from "lucide-react";
import type { Stop, Activity } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { ActivityRow } from "@/features/itinerary/components/ActivityRow";
import { AddActivityDialog } from "@/features/itinerary/components/AddActivityDialog";
import { formatDateRange } from "@/lib/format";

interface StopCardProps {
  stop: Stop;
  activities: Activity[];
  currency?: string;
  onRemove?: (stopId: number) => void;
  onRemoveActivity?: (stopId: number, activityId: number) => void;
  /** show the "Add activity" button — only useful in builder mode. */
  allowAddActivity?: boolean;
  children?: React.ReactNode;
}

const transportIcons: Record<NonNullable<Stop["transport"]>, React.ReactNode> = {
  FLIGHT: <Plane className="h-3.5 w-3.5" />,
  TRAIN: <Train className="h-3.5 w-3.5" />,
  BUS: <Bus className="h-3.5 w-3.5" />,
  CAR: <Car className="h-3.5 w-3.5" />,
  OTHER: <MapPin className="h-3.5 w-3.5" />,
};

export function StopCard({
  stop,
  activities,
  currency,
  onRemove,
  onRemoveActivity,
  allowAddActivity = false,
  children,
}: StopCardProps) {
  const [addingActivity, setAddingActivity] = useState(false);

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {stop.transport && (
          <Badge tone="accent" leadingIcon={transportIcons[stop.transport]}>
            {stop.transport.toLowerCase()}
          </Badge>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${stop.cityName}`}
            onClick={() => onRemove(stop.id)}
            className="rounded-full p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 flex-shrink-0 -rotate-3 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 font-display text-lg font-bold text-primary">
          {stop.order + 1}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-text">
            {stop.cityName}
            <span className="ml-2 text-base font-normal text-muted">{stop.countryName}</span>
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            <Calendar className="h-4 w-4" />
            {formatDateRange(stop.arrivalDate, stop.departureDate)}
          </p>
          {stop.notes && <p className="mt-2 text-sm text-muted/90">{stop.notes}</p>}
        </div>
      </div>

      {activities.length > 0 && (
        <ul className="mt-4 space-y-2">
          {activities.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              currency={currency}
              onRemove={onRemoveActivity ? (id) => onRemoveActivity(stop.id, id) : undefined}
            />
          ))}
        </ul>
      )}

      {allowAddActivity && (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setAddingActivity(true)}
            leadingIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
          >
            {activities.length > 0 ? "Add another activity" : "Add an activity"}
          </Button>
        </div>
      )}

      {children}

      {addingActivity && (
        <AddActivityDialog
          stop={stop}
          open={addingActivity}
          onClose={() => setAddingActivity(false)}
        />
      )}
    </Card>
  );
}
