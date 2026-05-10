import type { City } from "@hackathon/shared";
import { Badge } from "@/components/primitives/Badge";
import { cn } from "@/lib/cn";

interface CityCardProps {
  city: City;
  onSelect?: (city: City) => void;
  selected?: boolean;
}

export function CityCard({ city, onSelect, selected }: CityCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(city)}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-3xl border-2 bg-surface text-left shadow-card transition-all",
        selected ? "border-primary -translate-y-0.5" : "border-border hover:border-primary hover:-translate-y-0.5",
      )}
    >
      <div className="aspect-[5/3] overflow-hidden bg-bg">
        {city.imageUrl ? (
          <img src={city.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🌍</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold text-text">{city.name}</h3>
            <p className="text-xs text-muted">{city.country}</p>
          </div>
          <CostStamp cost={city.costIndex} />
        </div>
        {city.blurb && <p className="line-clamp-2 text-sm text-muted">{city.blurb}</p>}
        <div className="mt-1 flex items-center gap-2">
          <PopularityDots value={city.popularity} />
          <Badge tone="accent">{city.popularity}% loved</Badge>
        </div>
      </div>
    </button>
  );
}

function CostStamp({ cost }: { cost: 1 | 2 | 3 | 4 }) {
  return (
    <span
      aria-label={`Cost index ${cost} of 4`}
      className="inline-flex h-9 items-center gap-0.5 rounded-md border-2 border-dashed border-gold/40 bg-gold/10 px-2 font-display text-base font-bold text-gold -rotate-3"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={i < cost ? "" : "opacity-25"}>
          $
        </span>
      ))}
    </span>
  );
}

function PopularityDots({ value }: { value: number }) {
  const dots = Math.round(value / 20);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < dots ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}
