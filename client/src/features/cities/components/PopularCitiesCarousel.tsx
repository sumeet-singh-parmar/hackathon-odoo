import type { City } from "@hackathon/shared";
import { CityCard } from "@/features/cities/components/CityCard";

interface PopularCitiesCarouselProps {
  cities: City[];
  onSelect?: (city: City) => void;
}

export function PopularCitiesCarousel({ cities, onSelect }: PopularCitiesCarouselProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {cities.map((c) => (
          <div key={c.id} className="w-64 flex-shrink-0 sm:w-auto">
            <CityCard city={c} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
