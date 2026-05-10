import { Calendar, Wallet } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { ItineraryView } from "@/features/itinerary/components/ItineraryView";
import { CopyTripCTA } from "@/features/share/components/CopyTripCTA";
import { formatDateRange, formatMoney, daysBetween } from "@/lib/format";

interface PublicTripViewProps {
  trip: Trip;
}

export function PublicTripView({ trip }: PublicTripViewProps) {
  const days = daysBetween(trip.startDate, trip.endDate);
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[21/9] bg-bg">
          {trip.coverUrl ? (
            <img src={trip.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl">✈️</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/30 to-transparent px-6 pb-6 pt-12">
            <Badge tone="gold" stamp className="mb-3">
              Shared trip
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              {trip.name}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-6 py-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateRange(trip.startDate, trip.endDate)} · {days} days
          </span>
          {trip.budget != null && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Budget {formatMoney(trip.budget, trip.currency)}
            </span>
          )}
        </div>
        {trip.description && (
          <p className="border-t border-border px-6 py-4 text-base text-text/80">{trip.description}</p>
        )}
      </Card>

      <ItineraryView trip={trip} />
      <CopyTripCTA shareToken={trip.shareToken} />
    </div>
  );
}
