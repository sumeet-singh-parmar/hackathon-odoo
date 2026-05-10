import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MapPin, SearchX, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { Pagination } from "@/components/data-display/Pagination";
import {
  SearchFilterBar,
  type CitySortKey,
  type CostCap,
} from "@/components/forms/SearchFilterBar";
import { TripCard } from "@/features/trips/components/TripCard";
import { PopularTripsCarousel } from "@/features/trips/components/PopularTripsCarousel";
import { CityCard } from "@/features/cities/components/CityCard";
import { CityDetailModal } from "@/features/cities/components/CityDetailModal";
import { useTrips, useFeaturedTrips } from "@/features/trips/hooks/useTrips";
import { useCitySearch } from "@/features/cities/hooks/useCities";
import type { City, TripStatus } from "@hackathon/shared";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const CITIES_PER_PAGE = 6;

// Static region list — matches what the seed inserts. Keeps the dropdown stable
// before the first city query lands.
const KNOWN_REGIONS = [
  "Asia",
  "Europe",
  "Americas",
  "Africa",
  "Oceania",
  "Middle East",
];

export function DashboardPage() {
  const featured = useFeaturedTrips();
  const trips = useTrips();
  const navigate = useNavigate();

  const [cityQuery, setCityQuery] = useState("");
  const [cityPage, setCityPage] = useState(1);
  const [sort, setSort] = useState<CitySortKey>("popularity");
  const [costMax, setCostMax] = useState<CostCap | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [openCity, setOpenCity] = useState<City | null>(null);
  const debouncedQuery = useDebouncedValue(cityQuery, 300);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setCityPage(1);
    };
  }

  const cities = useCitySearch({
    q: debouncedQuery || undefined,
    sort,
    costMax,
    region,
    page: cityPage,
    limit: CITIES_PER_PAGE,
  });

  const isSearching = cityQuery !== debouncedQuery || cities.isFetching;
  const totalPages = cities.data ? Math.max(1, Math.ceil(cities.data.total / CITIES_PER_PAGE)) : 1;

  const upcoming = useMemo(() => {
    // Show whatever the user is actively working on — ongoing first, then planned
    // by start date, then drafts by most recently touched. Past dates are kept
    // so a trip you just flipped to PLANNED still surfaces; flipping it to
    // COMPLETED removes it from the section.
    const order: Record<TripStatus, number> = {
      ONGOING: 0,
      PLANNED: 1,
      DRAFT: 2,
      COMPLETED: 3,
    };
    return (trips.data ?? [])
      .filter((t) => t.status !== "COMPLETED")
      .sort((a, b) => {
        const byStatus = order[a.status] - order[b.status];
        if (byStatus !== 0) return byStatus;
        if (a.status === "DRAFT") {
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
        }
        return +new Date(a.startDate) - +new Date(b.startDate);
      })
      .slice(0, 3);
  }, [trips.data]);

  return (
    <div className="space-y-10">
      <section>
        {featured.isLoading && <PageSpinner label="Loading featured trips…" />}
        {featured.data && featured.data.length > 0 && (
          <PopularTripsCarousel trips={featured.data} />
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <PageHeader hand="coming up" title="Your next trips" />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/trips/new")}
              leadingIcon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
            >
              Plan a new trip
            </Button>
            <Link
              to="/trips"
              className="hidden font-display text-sm font-semibold text-accent hover:underline sm:inline"
            >
              See all →
            </Link>
          </div>
        </div>
        {trips.isLoading && <PageSpinner label="Loading your trips…" />}
        {trips.isError && <ErrorBanner title="Couldn't load trips" message={(trips.error as Error).message} />}
        {trips.data && upcoming.length === 0 && (
          <EmptyState
            illustration={<MapPin className="h-12 w-12" strokeWidth={1.5} />}
            title="Nothing on the calendar"
            description="Start your first trip — even a weekend counts."
            action={<Button onClick={() => navigate("/trips/new")}>Plan a trip</Button>}
          />
        )}
        {upcoming.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((t, i) => (
              <TripCard key={t.id} trip={t} rotate={i % 3 === 0 ? "left" : i % 3 === 1 ? "right" : "none"} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <SearchFilterBar
          value={cityQuery}
          onChange={(v) => {
            setCityQuery(v);
            setCityPage(1);
          }}
          placeholder="Search cities, countries..."
          loading={isSearching}
          sort={sort}
          onSortChange={resetPage(setSort)}
          costMax={costMax}
          onCostMaxChange={resetPage(setCostMax)}
          region={region}
          onRegionChange={resetPage(setRegion)}
          regions={KNOWN_REGIONS}
        />
        <PageHeader hand="bucket list?" title="Popular right now" subtitle="Cities other travellers are planning around." />

        {cities.isError && <ErrorBanner title="Couldn't load cities" message={(cities.error as Error).message} />}

        {cities.data && cities.data.items.length === 0 && (
          <EmptyState
            illustration={<SearchX className="h-12 w-12" strokeWidth={1.5} />}
            title={debouncedQuery ? `No cities match "${debouncedQuery}"` : "No cities yet"}
            description={debouncedQuery ? "Try a different search term." : undefined}
          />
        )}

        {cities.data && cities.data.items.length > 0 && (
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${cities.isFetching ? "opacity-60 transition-opacity" : ""}`}>
            {cities.data.items.map((c) => (
              <CityCard key={c.id} city={c} onSelect={setOpenCity} />
            ))}
          </div>
        )}

        <CityDetailModal city={openCity} onClose={() => setOpenCity(null)} />

        {cities.data && totalPages > 1 && (
          <Pagination page={cityPage} totalPages={totalPages} onChange={setCityPage} className="pt-2" />
        )}
      </section>
    </div>
  );
}
