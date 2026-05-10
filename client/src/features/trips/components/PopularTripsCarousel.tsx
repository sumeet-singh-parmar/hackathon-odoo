import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/cn";
import { formatDateRange } from "@/lib/format";

interface PopularTripsCarouselProps {
  trips: Trip[];
  intervalMs?: number;
}

export function PopularTripsCarousel({ trips, intervalMs = 6000 }: PopularTripsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const count = trips.length;
  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl border-2 border-border bg-surface shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Popular trips"
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {trips.map((trip) => (
          <Slide key={trip.id} trip={trip} currentUserId={user?.id} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous trip"
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-text shadow-card transition hover:bg-surface hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next trip"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-text shadow-card transition hover:bg-surface hover:scale-105"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {trips.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-primary" : "w-2 bg-surface/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Slide({ trip, currentUserId }: { trip: Trip; currentUserId?: number }) {
  // If the viewer owns this featured trip, send them to the owner view (/trips/:id)
  // so their UserMenu / edit affordances stay visible. Otherwise route to the
  // public read view via the share token.
  const ownsTrip = currentUserId != null && trip.ownerId === currentUserId;
  const href = ownsTrip
    ? `/trips/${trip.id}`
    : trip.shareToken
      ? `/share/${trip.shareToken}`
      : `/trips/${trip.id}`;

  return (
    <Link
      to={href}
      className="group relative flex w-full flex-shrink-0 aspect-[21/9] sm:aspect-[21/9] focus:outline-none"
    >
      {trip.coverUrl ? (
        <img
          src={trip.coverUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30 text-6xl">
          ✈
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
        <p className="font-hand text-3xl sm:text-4xl drop-shadow">{trip.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm sm:text-base text-white/85">
          <Calendar className="h-4 w-4" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-white">
          {ownsTrip ? "Open my trip" : "Open trip"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
