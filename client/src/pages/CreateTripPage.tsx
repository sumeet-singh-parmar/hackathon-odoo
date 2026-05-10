import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { CreateTripForm } from "@/features/trips/components/CreateTripForm";
import { useFeaturedTrips, useTrip } from "@/features/trips/hooks/useTrips";
import { cn } from "@/lib/cn";

export function CreateTripPage() {
  const [params, setParams] = useSearchParams();
  const fromRaw = params.get("from");
  const fromId = fromRaw ? Number(fromRaw) : undefined;

  const featured = useFeaturedTrips();
  const source = useTrip(fromId);

  function pickSuggestion(t: Trip) {
    setParams({ from: String(t.id) }, { replace: true });
    // scroll the form into view on small screens
    requestAnimationFrame(() => {
      document.getElementById("plan-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearSuggestion() {
    setParams({}, { replace: true });
  }

  const defaults = source.data
    ? {
        name: source.data.name,
        description: source.data.description ?? undefined,
        coverUrl: source.data.coverUrl ?? undefined,
        currency: source.data.currency,
      }
    : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my trips
      </Link>

      <PageHeader
        hand="new adventure"
        title="Plan a new trip"
        subtitle="The rough shape — name, dates, vibe. You can fill in stops next."
      />

      <section id="plan-form">
        <Card className="p-6 sm:p-8">
          {fromId && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" strokeWidth={2.25} />
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-text">
                  Pre-filled from a suggestion
                </p>
                <p className="text-xs text-muted">
                  Cover image and name were copied across — edit anything you want before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={clearSuggestion}
                className="font-display text-xs font-semibold text-accent hover:underline"
              >
                Start blank
              </button>
            </div>
          )}
          {/* key forces a remount when the suggestion changes so RHF picks up the new defaults */}
          <CreateTripForm key={fromId ?? "blank"} defaults={defaults} />
        </Card>
      </section>

      {featured.data && featured.data.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-end gap-3">
            <div>
              <p className="font-hand text-xl text-primary">need a starting point?</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-text">
                Suggestions to riff on
              </h2>
            </div>
            <span className="mb-1.5 flex-1 border-b-2 border-dashed border-border" />
          </div>
          <p className="text-sm text-muted">
            Click one and we'll pre-fill the cover and name — change anything from there.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((t) => (
              <SuggestionCard
                key={t.id}
                trip={t}
                active={t.id === fromId}
                onPick={() => pickSuggestion(t)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SuggestionCard({
  trip,
  active,
  onPick,
}: {
  trip: Trip;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-3xl border-2 bg-surface text-left shadow-card transition-all",
        active
          ? "border-primary -translate-y-0.5 shadow-lift"
          : "border-border hover:-translate-y-0.5 hover:border-primary",
      )}
    >
      <div className="aspect-[16/10] overflow-hidden bg-bg">
        {trip.coverUrl ? (
          <img
            src={trip.coverUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">✈</div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="font-hand text-xl text-text">{trip.name}</p>
        {trip.description && (
          <p className="line-clamp-2 text-xs text-muted">{trip.description}</p>
        )}
        {active && (
          <Badge tone="primary" className="mt-2 self-start">
            Selected
          </Badge>
        )}
      </div>
    </button>
  );
}
