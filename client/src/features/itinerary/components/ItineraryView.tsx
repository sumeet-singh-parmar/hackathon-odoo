import { useState } from "react";
import type { Trip, Stop, Activity } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { ItineraryViewToggle, type ItineraryView as ViewMode } from "@/features/itinerary/components/ItineraryViewToggle";
import { StopCard } from "@/features/itinerary/components/StopCard";
import { useStops, useActivitiesForStops } from "@/features/itinerary/hooks/useItinerary";
import { PageSpinner } from "@/components/primitives/Spinner";
import { formatDate } from "@/lib/format";

interface ItineraryViewProps {
  trip: Trip;
}

export function ItineraryView({ trip }: ItineraryViewProps) {
  const [mode, setMode] = useState<ViewMode>("list");
  const stopsQuery = useStops(trip.id);
  const stops = stopsQuery.data ?? [];
  const activitiesResults = useActivitiesForStops(stops.map((s) => s.id));

  if (stopsQuery.isLoading) return <PageSpinner label="Loading itinerary…" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ItineraryViewToggle value={mode} onChange={setMode} />
      </div>
      {mode === "list" ? (
        <ListView stops={stops} activitiesResults={activitiesResults} currency={trip.currency} />
      ) : (
        <CalendarView stops={stops} activitiesResults={activitiesResults} />
      )}
    </div>
  );
}

function ListView({
  stops,
  activitiesResults,
  currency,
}: {
  stops: Stop[];
  activitiesResults: ReturnType<typeof useActivitiesForStops>;
  currency: string;
}) {
  return (
    <div className="space-y-3">
      {stops.map((stop, i) => (
        <StopCard
          key={stop.id}
          stop={stop}
          activities={activitiesResults[i]?.data ?? []}
          currency={currency}
        />
      ))}
    </div>
  );
}

function CalendarView({
  stops,
  activitiesResults,
}: {
  stops: Stop[];
  activitiesResults: ReturnType<typeof useActivitiesForStops>;
}) {
  const days = new Map<string, { stop: Stop; activities: Activity[] }[]>();
  stops.forEach((stop, i) => {
    const acts = activitiesResults[i]?.data ?? [];
    const byDate = new Map<string, Activity[]>();
    acts.forEach((a) => {
      const k = a.date;
      byDate.set(k, [...(byDate.get(k) ?? []), a]);
    });
    byDate.forEach((list, date) => {
      days.set(date, [...(days.get(date) ?? []), { stop, activities: list }]);
    });
  });

  const sorted = Array.from(days.entries()).sort(([a], [b]) => a.localeCompare(b));
  if (sorted.length === 0) {
    return <p className="text-center text-sm text-muted">No activities scheduled yet.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(([date, entries]) => (
        <Card key={date} className="p-5">
          <p className="font-display text-lg font-bold text-text">{formatDate(date, { weekday: "long", month: "short", day: "numeric" })}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {entries.flatMap(({ stop, activities }) =>
              activities.map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="font-display font-semibold text-text">{a.name}</p>
                    <p className="text-xs text-muted">{stop.cityName}, {stop.countryName}</p>
                  </div>
                </li>
              )),
            )}
          </ul>
        </Card>
      ))}
    </div>
  );
}
