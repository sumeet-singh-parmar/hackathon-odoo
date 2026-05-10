import { useState } from "react";
import { CalendarPlus, MapPin } from "lucide-react";
import type { City, Trip } from "@hackathon/shared";
import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/primitives/Button";
import { Select } from "@/components/forms/Select";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { Spinner } from "@/components/primitives/Spinner";
import { useToast } from "@/components/feedback/Toast";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useAddStop } from "@/features/itinerary/hooks/useItinerary";

interface AddCityToTripDialogProps {
  city: City;
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export function AddCityToTripDialog({ city, open, onClose, onAdded }: AddCityToTripDialogProps) {
  const trips = useTrips();
  const [tripId, setTripId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addStop = useAddStop(tripId ?? 0);
  const { push } = useToast();

  // Filter to user-owned trips that are still in planning (DRAFT/PLANNED).
  const eligible = (trips.data ?? []).filter((t: Trip) => t.status !== "COMPLETED");
  const tripOptions = eligible.map((t) => ({
    value: String(t.id),
    label: `${t.name} · ${t.startDate}–${t.endDate}`,
  }));
  const selectedTrip = eligible.find((t) => t.id === tripId) ?? null;

  function handleTripChange(value: string) {
    const id = Number(value);
    setTripId(id);
    const trip = eligible.find((t) => t.id === id);
    if (trip) {
      // pre-fill stop dates with the trip range as a sensible default.
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!tripId) {
      setError("Pick a trip first.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Pick stop dates.");
      return;
    }
    try {
      await addStop.mutateAsync({
        cityId: city.id,
        startDate,
        endDate,
      });
      push({
        variant: "success",
        title: "Added to trip",
        message: `${city.name} → ${selectedTrip?.name ?? "your trip"}`,
      });
      onAdded?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add to trip");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${city.name} to a trip`}
      description="Pick the trip and the dates you'll be there."
    >
      {trips.isLoading ? (
        <Spinner label="Loading your trips…" />
      ) : eligible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-bg/40 p-6 text-center text-sm text-muted">
          You don't have an open trip yet. Start one from the dashboard, then come back.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Select
            label="Trip"
            placeholder="Pick a trip"
            options={tripOptions}
            value={tripId == null ? "" : String(tripId)}
            onChange={(e) => handleTripChange(e.target.value)}
            required
          />

          <DateRangePicker
            label="Dates at this stop"
            required
            startProps={{
              value: startDate,
              onChange: (e) => setStartDate(e.currentTarget.value),
              min: selectedTrip?.startDate,
              max: selectedTrip?.endDate,
            }}
            endProps={{
              value: endDate,
              onChange: (e) => setEndDate(e.currentTarget.value),
              min: selectedTrip?.startDate,
              max: selectedTrip?.endDate,
            }}
          />

          {error && <ErrorBanner title="Couldn't add stop" message={error} />}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addStop.isPending}
              leadingIcon={<MapPin className="h-4 w-4" strokeWidth={2.25} />}
              trailingIcon={<CalendarPlus className="h-4 w-4" strokeWidth={2.25} />}
            >
              Add stop
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
