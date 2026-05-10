import { useState } from "react";
import { Sparkles, SearchX } from "lucide-react";
import type { ActivityResponse } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-display/Pagination";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { ActivityDetailModal } from "@/features/activities/components/ActivityDetailModal";
import {
  ActivityFilters,
  filtersToQuery,
  initialActivityFilters,
  type ActivityFilterState,
} from "@/features/activities/components/ActivityFilters";
import { useActivitySearch } from "@/features/activities/hooks/useActivitySearch";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useCities } from "@/features/cities/hooks/useCities";

const PAGE_SIZE = 12;

export function ActivitiesPage() {
  const [filters, setFilters] = useState<ActivityFilterState>(initialActivityFilters);
  const [page, setPage] = useState(1);
  const [openActivity, setOpenActivity] = useState<ActivityResponse | null>(null);
  const debounced = useDebouncedValue(filters, 300);

  // city map for showing city names beside each activity card
  const cities = useCities();
  const cityById = new Map((cities.data ?? []).map((c) => [c.id, `${c.name}, ${c.country}`]));

  const result = useActivitySearch({
    ...filtersToQuery(debounced),
    page,
    limit: PAGE_SIZE,
  });

  function handleFilterChange(next: ActivityFilterState) {
    setFilters(next);
    setPage(1);
  }

  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        hand="things to do"
        title="Activity catalog"
        subtitle="Curated experiences across every city in Traveloop. Filter, find, then pin to a stop."
      />

      <ActivityFilters value={filters} onChange={handleFilterChange} />

      {result.isLoading && <PageSpinner label="Loading activities…" />}
      {result.isError && (
        <ErrorBanner title="Couldn't load activities" message={(result.error as Error).message} />
      )}

      {result.data && result.data.items.length === 0 && (
        <EmptyState
          illustration={<SearchX className="h-12 w-12" strokeWidth={1.5} />}
          title="No activities match"
          description="Loosen a filter, or search for something else."
        />
      )}

      {result.data && result.data.items.length > 0 && (
        <>
          <div className="text-sm text-muted">
            <Sparkles className="mr-1 inline-block h-4 w-4 text-gold" strokeWidth={2.25} />
            {result.data.total} {result.data.total === 1 ? "match" : "matches"}
          </div>
          <div
            className={
              "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 " +
              (result.isFetching ? "opacity-60 transition-opacity" : "")
            }
          >
            {result.data.items.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                cityLabel={cityById.get(a.cityId)}
                onSelect={setOpenActivity}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} className="pt-2" />
          )}
        </>
      )}

      <ActivityDetailModal
        activity={openActivity}
        cityLabel={openActivity ? cityById.get(openActivity.cityId) : undefined}
        onClose={() => setOpenActivity(null)}
      />
    </div>
  );
}
