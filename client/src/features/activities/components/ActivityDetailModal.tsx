import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock, MapPin, Pin, Wallet } from "lucide-react";
import type { ActivityResponse, Trip, TripDetail } from "@hackathon/shared";
import { Modal } from "@/components/feedback/Modal";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Select } from "@/components/forms/Select";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useToast } from "@/components/feedback/Toast";
import { api } from "@/lib/api";
import { formatDateRange, formatMoney } from "@/lib/format";

interface ActivityDetailModalProps {
  activity: ActivityResponse | null;
  cityLabel?: string;
  onClose: () => void;
}

const typeTone: Record<ActivityResponse["type"], React.ComponentProps<typeof Badge>["tone"]> = {
  SIGHTSEEING: "primary",
  FOOD: "gold",
  ADVENTURE: "success",
  NIGHTLIFE: "danger",
  CULTURE: "accent",
  NATURE: "success",
};

interface StopOption {
  value: string;
  label: string;
}

export function ActivityDetailModal({ activity, cityLabel, onClose }: ActivityDetailModalProps) {
  const trips = useTrips();
  const navigate = useNavigate();
  const { push } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [stopOptions, setStopOptions] = useState<StopOption[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsError, setStopsError] = useState<string | null>(null);
  const [pinning, setPinning] = useState(false);

  // reset state whenever a different activity is shown
  useEffect(() => {
    setSelectedTripId(null);
    setSelectedStopId(null);
    setStopOptions([]);
    setStopsError(null);
  }, [activity?.id]);

  // when the user picks a trip, fetch its detail and filter stops to ones in
  // the activity's city. server enforces that pins must match cityId.
  useEffect(() => {
    if (!activity || selectedTripId == null) {
      setStopOptions([]);
      return;
    }
    let cancelled = false;
    setStopsLoading(true);
    setStopsError(null);
    api<TripDetail>(`/api/trips/${selectedTripId}`)
      .then((detail) => {
        if (cancelled) return;
        const matching = detail.stops.filter((s) => s.cityId === activity.cityId);
        setStopOptions(
          matching.map((s) => ({
            value: String(s.id),
            label: `${s.city.name} · ${formatDateRange(s.startDate, s.endDate)}`,
          })),
        );
        setSelectedStopId(matching[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setStopsError(err instanceof Error ? err.message : "Couldn't load stops");
      })
      .finally(() => {
        if (!cancelled) setStopsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activity, selectedTripId]);

  if (!activity) return null;

  const myTrips = trips.data ?? [];
  const tripOptions: StopOption[] = myTrips.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  async function handlePin() {
    if (!activity || selectedStopId == null) return;
    setPinning(true);
    try {
      await api(`/api/stops/${selectedStopId}/activities`, {
        method: "POST",
        body: { activityId: activity.id },
      });
      push({
        variant: "success",
        title: "Activity pinned",
        message: `${activity.name} added to your stop.`,
      });
      onClose();
      if (selectedTripId) navigate(`/trips/${selectedTripId}`);
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't pin",
        message: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setPinning(false);
    }
  }

  function tripsWithMatchingCity(): Trip[] {
    // Heuristic: surface trips first; the user's stops still need to be checked.
    // We can't filter by cityId here because TripSummary doesn't carry stops.
    return myTrips;
  }

  const surfacedTrips = tripsWithMatchingCity();
  const hasNoTrips = !trips.isLoading && surfacedTrips.length === 0;

  return (
    <Modal open onClose={onClose} size="lg">
      <div className="space-y-5 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={typeTone[activity.type]} stamp>
              {activity.type.toLowerCase()}
            </Badge>
            <h2 className="mt-2 font-display text-2xl font-bold text-text">{activity.name}</h2>
            {cityLabel && (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {cityLabel}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {activity.durationHours}h
            </span>
            <span className="inline-flex items-center gap-1 font-display font-semibold text-text">
              <Wallet className="h-4 w-4 text-gold" strokeWidth={2.25} />
              {activity.baseCost > 0 ? formatMoney(activity.baseCost) : "Free"}
            </span>
          </div>
        </div>

        {activity.description && (
          <p className="text-base text-text/85">{activity.description}</p>
        )}

        <div className="border-t border-border pt-5">
          <p className="font-display text-lg font-bold text-text">
            <Pin className="mr-1 inline-block h-4 w-4 text-primary" strokeWidth={2.25} />
            Pin to one of your trips
          </p>
          <p className="text-sm text-muted">
            The trip needs a stop in {cityLabel?.split(",")[0] ?? "this city"} for the pin to land.
          </p>

          {trips.isLoading && <PageSpinner label="Loading your trips…" />}
          {trips.isError && (
            <ErrorBanner title="Couldn't load trips" message={(trips.error as Error).message} />
          )}

          {hasNoTrips && (
            <div className="mt-3 rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-5 text-center">
              <p className="text-sm text-muted">You don't have any trips yet.</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  onClose();
                  navigate("/trips/new");
                }}
              >
                Plan a trip first
              </Button>
            </div>
          )}

          {!hasNoTrips && tripOptions.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Select
                label="Trip"
                placeholder="Pick a trip"
                options={tripOptions}
                value={selectedTripId == null ? "" : String(selectedTripId)}
                onChange={(e) =>
                  setSelectedTripId(e.target.value ? Number(e.target.value) : null)
                }
              />
              <Select
                label={
                  selectedTripId == null
                    ? "Stop (pick a trip first)"
                    : stopsLoading
                      ? "Loading stops…"
                      : stopOptions.length === 0
                        ? `No stop in ${cityLabel?.split(",")[0] ?? "this city"} yet`
                        : "Stop"
                }
                placeholder={stopOptions.length === 0 ? "—" : "Pick a stop"}
                disabled={selectedTripId == null || stopsLoading || stopOptions.length === 0}
                options={stopOptions}
                value={selectedStopId == null ? "" : String(selectedStopId)}
                onChange={(e) =>
                  setSelectedStopId(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
          )}

          {stopsError && (
            <p className="mt-2 text-sm text-danger">{stopsError}</p>
          )}

          {selectedTripId != null && !stopsLoading && stopOptions.length === 0 && !stopsError && (
            <p className="mt-2 text-sm text-muted">
              Add a stop in this city from the trip's itinerary, then come back.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border bg-bg/40 px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handlePin}
          loading={pinning}
          disabled={selectedStopId == null}
          leadingIcon={<Pin className="h-4 w-4" strokeWidth={2.25} />}
        >
          Pin to stop
        </Button>
      </div>
    </Modal>
  );
}
