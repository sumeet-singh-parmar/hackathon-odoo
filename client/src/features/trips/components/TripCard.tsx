import { useState } from "react";
import { Link } from "react-router";
import { Calendar, Wallet, MapPin, Trash2 } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { Badge } from "@/components/primitives/Badge";
import { PolaroidCard } from "@/components/data-display/PolaroidCard";
import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/primitives/Button";
import { useDeleteTrip } from "@/features/trips/hooks/useTrips";
import { useToast } from "@/components/feedback/Toast";
import { formatDateRange, formatMoney, daysBetween } from "@/lib/format";

interface TripCardProps {
  trip: Trip;
  rotate?: "left" | "right" | "none";
  showDelete?: boolean;
}

const statusTone = {
  DRAFT: "neutral" as const,
  PLANNED: "primary" as const,
  ONGOING: "success" as const,
  COMPLETED: "accent" as const,
};

const statusLabel = {
  DRAFT: "Draft",
  PLANNED: "Planned",
  ONGOING: "On the road",
  COMPLETED: "Trip done",
};

export function TripCard({ trip, rotate = "left", showDelete = false }: TripCardProps) {
  const days = daysBetween(trip.startDate, trip.endDate);
  const [confirming, setConfirming] = useState(false);
  const remove = useDeleteTrip();
  const { push } = useToast();

  async function handleDelete() {
    try {
      await remove.mutateAsync(trip.id);
      push({ variant: "success", title: "Trip deleted", message: trip.name });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't delete",
        message: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="group relative">
      {showDelete && (
        <button
          type="button"
          aria-label={`Delete ${trip.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(true);
          }}
          className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-muted opacity-0 shadow-card transition-all hover:text-danger group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Link to={`/trips/${trip.id}`} className="block">
        <PolaroidCard
          rotate={rotate}
          cover={
            trip.coverUrl ? (
              <img
                src={trip.coverUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-4xl">
                ✈
              </div>
            )
          }
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-hand text-2xl text-text">{trip.name}</h3>
            <Badge tone={statusTone[trip.status]} stamp>
              {statusLabel[trip.status]}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(trip.startDate, trip.endDate)} · {days} {days === 1 ? "day" : "days"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
            {trip.stopCount != null && trip.stopCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {trip.stopCount} {trip.stopCount === 1 ? "stop" : "stops"}
              </span>
            )}
            {trip.budget != null && (
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                {formatMoney(trip.budget, trip.currency)}
              </span>
            )}
          </div>
        </PolaroidCard>
      </Link>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this trip?"
        description="This is permanent. Stops, activities, expenses, packing, and notes all go with it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={remove.isPending}>
              Yes, delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text">
          You'll lose <span className="font-display font-semibold">{trip.name}</span> and everything attached to it.
        </p>
      </Modal>
    </div>
  );
}
