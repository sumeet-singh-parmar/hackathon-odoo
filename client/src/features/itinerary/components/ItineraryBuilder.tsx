import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import { StopCard } from "@/features/itinerary/components/StopCard";
import { AddStopButton } from "@/features/itinerary/components/AddStopButton";
import { AddStopDialog } from "@/features/itinerary/components/AddStopDialog";
import {
  useStops,
  useActivitiesForStops,
  useRemoveStop,
} from "@/features/itinerary/hooks/useItinerary";
import { removeActivity } from "@/features/itinerary/api/stops";

interface ItineraryBuilderProps {
  trip: Trip;
}

export function ItineraryBuilder({ trip }: ItineraryBuilderProps) {
  const stopsQuery = useStops(trip.id);
  const removeStop = useRemoveStop(trip.id);
  const qc = useQueryClient();
  const { push } = useToast();
  const [adding, setAdding] = useState(false);

  const stops = stopsQuery.data ?? [];
  const activitiesResults = useActivitiesForStops(stops.map((s) => s.id));

  if (stopsQuery.isLoading) return <PageSpinner label="Loading stops…" />;
  if (stopsQuery.isError)
    return <ErrorBanner title="Couldn't load stops" message={(stopsQuery.error as Error).message} />;

  if (stops.length === 0) {
    return (
      <>
        <EmptyState
          illustration={<Compass className="h-12 w-12" strokeWidth={1.5} />}
          title="No stops yet"
          description="Drop in your first city to start the route."
          action={<Button onClick={() => setAdding(true)}>Add first stop</Button>}
        />
        {adding && <AddStopDialog tripId={trip.id} onClose={() => setAdding(false)} />}
      </>
    );
  }

  async function handleRemoveActivity(stopId: number, activityId: number) {
    try {
      await removeActivity(stopId, activityId);
      qc.invalidateQueries({ queryKey: ["activities", stopId] });
      push({ variant: "success", title: "Activity removed" });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't remove",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  return (
    <div className="space-y-3">
      {stops.map((stop, i) => (
        <StopCard
          key={stop.id}
          stop={stop}
          activities={activitiesResults[i]?.data ?? []}
          currency={trip.currency}
          allowAddActivity
          onRemove={async (id) => {
            try {
              await removeStop.mutateAsync(id);
              push({ variant: "success", title: "Stop removed" });
            } catch (err) {
              push({
                variant: "danger",
                title: "Couldn't remove",
                message: err instanceof Error ? err.message : "Try again",
              });
            }
          }}
          onRemoveActivity={handleRemoveActivity}
        />
      ))}

      <AddStopButton onClick={() => setAdding(true)} />
      {adding && <AddStopDialog tripId={trip.id} onClose={() => setAdding(false)} />}
    </div>
  );
}
