import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, MapPin, Search, Layers, Filter, ArrowDownUp } from "lucide-react";
import type { Trip, TripStatus } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { TripCard } from "@/features/trips/components/TripCard";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { cn } from "@/lib/cn";

interface Bucket {
  key: TripStatus | "DRAFT";
  hand: string;
  title: string;
  empty: string;
}

const buckets: Bucket[] = [
  { key: "ONGOING", hand: "right now", title: "Ongoing", empty: "Nothing on the road today." },
  { key: "PLANNED", hand: "soon", title: "Up-coming", empty: "No upcoming trips planned." },
  { key: "DRAFT", hand: "ideas", title: "Drafts", empty: "No drafts in progress." },
  { key: "COMPLETED", hand: "memories", title: "Completed", empty: "No completed trips yet." },
];

export function TripsPage() {
  const trips = useTrips();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const all = trips.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [trips.data, query]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);

  const totalShown = filtered.length;
  const showEmpty = trips.data && totalShown === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        hand="all the routes"
        title="My trips"
        subtitle="Drafts, the planned ones, and the ones already lived."
        actions={
          <Link
            to="/trips/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-display text-sm font-semibold text-primary-fg shadow-[0_3px_0_0_rgb(199_72_52)] hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New trip
          </Link>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your trips..."
            className="block w-full rounded-xl border-2 border-border bg-surface pl-10 pr-4 py-2.5 text-base text-text placeholder:text-muted/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          />
        </div>
        {/* todo: wire these up — server-side group/filter/sort once Nisha exposes the params */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" leadingIcon={<Layers className="h-4 w-4" strokeWidth={2.25} />}>Group by</Button>
          <Button type="button" variant="secondary" size="sm" leadingIcon={<Filter className="h-4 w-4" strokeWidth={2.25} />}>Filter</Button>
          <Button type="button" variant="secondary" size="sm" leadingIcon={<ArrowDownUp className="h-4 w-4" strokeWidth={2.25} />}>Sort by...</Button>
        </div>
      </div>

      {trips.isLoading && <PageSpinner label="Loading trips…" />}
      {trips.isError && <ErrorBanner title="Couldn't load trips" message={(trips.error as Error).message} />}

      {showEmpty && (
        <EmptyState
          illustration={<MapPin className="h-12 w-12" strokeWidth={1.5} />}
          title={query ? `No trips match "${query}"` : "No trips yet"}
          description={
            query
              ? "Try a different search term, or clear the search."
              : "Start your first trip — it doesn't have to be far."
          }
          action={!query ? <Button onClick={() => navigate("/trips/new")}>Plan a trip</Button> : undefined}
        />
      )}

      {trips.data && totalShown > 0 && (
        <div className="space-y-8">
          {buckets.map((bucket) => {
            const items = grouped[bucket.key];
            if (!items || items.length === 0) return null;
            return (
              <section key={bucket.key} className="space-y-4">
                <SectionHeader hand={bucket.hand} title={bucket.title} count={items.length} />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t, i) => (
                    <TripCard
                      key={t.id}
                      trip={t}
                      rotate={i % 3 === 0 ? "left" : i % 3 === 1 ? "right" : "none"}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function groupByStatus(trips: Trip[]): Record<TripStatus, Trip[]> {
  const out: Record<TripStatus, Trip[]> = { DRAFT: [], PLANNED: [], ONGOING: [], COMPLETED: [] };
  for (const t of trips) out[t.status].push(t);
  // sort upcoming/ongoing by start date asc, completed by end date desc, drafts by updated desc
  out.ONGOING.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  out.PLANNED.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  out.COMPLETED.sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate));
  out.DRAFT.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  return out;
}

function SectionHeader({ hand, title, count }: { hand: string; title: string; count: number }) {
  return (
    <div className="flex items-end gap-3">
      <div>
        <p className="font-hand text-xl text-primary">{hand}</p>
        <h2 className={cn("font-display text-2xl font-bold leading-tight text-text")}>
          {title} <span className="ml-1 text-base font-normal text-muted">({count})</span>
        </h2>
      </div>
      <span className="mb-1.5 flex-1 border-b-2 border-dashed border-border" />
    </div>
  );
}
