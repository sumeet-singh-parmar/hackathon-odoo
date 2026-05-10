import { useState } from "react";
import { Globe } from "lucide-react";
import type { City } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { CityCard } from "@/features/cities/components/CityCard";
import { CityDetailModal } from "@/features/cities/components/CityDetailModal";
import { CitySearchInput } from "@/features/cities/components/CitySearchInput";
import { useCities } from "@/features/cities/hooks/useCities";

export function CitiesPage() {
  const [query, setQuery] = useState("");
  const [openCity, setOpenCity] = useState<City | null>(null);
  const cities = useCities(query);

  return (
    <div className="space-y-6">
      <PageHeader
        hand="where to next?"
        title="Explore cities"
        subtitle="Browse popular destinations or hunt for somewhere off the radar."
      />

      <div className="max-w-md">
        <CitySearchInput value={query} onChange={setQuery} placeholder="Search Tokyo, Lisbon, anywhere…" />
      </div>

      {cities.isLoading && <PageSpinner label="Loading cities…" />}
      {cities.isError && <ErrorBanner title="Couldn't load cities" message={(cities.error as Error).message} />}

      {cities.data && cities.data.length === 0 && (
        <EmptyState
          illustration={<Globe className="h-12 w-12" strokeWidth={1.5} />}
          title="No matches"
          description="Try a different city or country name."
        />
      )}

      {cities.data && cities.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.data.map((c) => (
            <CityCard key={c.id} city={c} onSelect={setOpenCity} />
          ))}
        </div>
      )}

      <CityDetailModal city={openCity} onClose={() => setOpenCity(null)} />
    </div>
  );
}
