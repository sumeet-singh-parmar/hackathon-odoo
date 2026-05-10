import { Link } from "react-router";
import { Calendar, Users, ArrowRight, Globe } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useFeaturedTrips } from "@/features/trips/hooks/useTrips";
import { formatDateRange, daysBetween } from "@/lib/format";

export function CommunityPage() {
  const featured = useFeaturedTrips();

  return (
    <div className="space-y-6">
      <PageHeader
        hand="from the community"
        title="Trips others are sharing"
        subtitle="Public itineraries from travellers like you. Open one to view, copy, or get inspired."
      />

      {featured.isLoading && <PageSpinner label="Loading shared trips…" />}
      {featured.isError && (
        <ErrorBanner
          title="Couldn't load community trips"
          message={(featured.error as Error).message}
        />
      )}

      {featured.data && featured.data.length === 0 && (
        <EmptyState
          illustration={<Users className="h-12 w-12" strokeWidth={1.5} />}
          title="No shared trips yet"
          description="Once travellers start making their trips public, they'll show up here."
        />
      )}

      {featured.data && featured.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.data.map((trip) => (
            <CommunityPostCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityPostCard({ trip }: { trip: Trip }) {
  const days = daysBetween(trip.startDate, trip.endDate);
  const href = trip.shareToken ? `/share/${trip.shareToken}` : `/trips/${trip.id}`;

  return (
    <Link to={href} className="group block">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-transform hover:-translate-y-1 hover:border-primary">
        <div className="aspect-[16/10] overflow-hidden bg-bg">
          {trip.coverUrl ? (
            <img
              src={trip.coverUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">✈️</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-hand text-2xl text-text">{trip.name}</p>
            <Badge tone="gold" stamp>
              <Globe className="h-3 w-3" strokeWidth={2.5} /> Public
            </Badge>
          </div>
          {trip.description && (
            <p className="line-clamp-2 text-sm text-muted">{trip.description}</p>
          )}
          <p className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(trip.startDate, trip.endDate)} · {days} {days === 1 ? "day" : "days"}
          </p>
          <span className="inline-flex items-center gap-1 font-display text-sm font-semibold text-accent">
            View itinerary
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
