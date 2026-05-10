import { useState } from "react";
import {
  CalendarPlus,
  Clock,
  Globe2,
  Heart,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { ActivityResponse, City } from "@hackathon/shared";
import { Modal } from "@/components/feedback/Modal";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useActivityCatalog } from "@/features/cities/hooks/useCities";
import { AddCityToTripDialog } from "@/features/cities/components/AddCityToTripDialog";
import {
  useSavedDestinations,
  useSaveDestination,
  useUnsaveDestination,
} from "@/features/profile/hooks/useSavedDestinations";
import { useToast } from "@/components/feedback/Toast";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

interface CityDetailModalProps {
  city: City | null;
  onClose: () => void;
}

const typeTone: Record<ActivityResponse["type"], React.ComponentProps<typeof Badge>["tone"]> = {
  SIGHTSEEING: "primary",
  FOOD: "gold",
  ADVENTURE: "success",
  NIGHTLIFE: "danger",
  CULTURE: "accent",
  NATURE: "success",
};

export function CityDetailModal({ city, onClose }: CityDetailModalProps) {
  const activities = useActivityCatalog(city?.id);
  const saved = useSavedDestinations();
  const save = useSaveDestination();
  const unsave = useUnsaveDestination();
  const { push } = useToast();
  const [adding, setAdding] = useState(false);

  if (!city) return null;

  const isSaved = (saved.data ?? []).some((s) => s.cityId === city.id);

  async function toggleSaved() {
    if (!city) return;
    try {
      if (isSaved) {
        await unsave.mutateAsync(city.id);
        push({ variant: "info", title: "Removed from saved" });
      } else {
        await save.mutateAsync(city.id);
        push({ variant: "success", title: "Saved for later", message: city.name });
      }
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't update",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  return (
    <>
      <Modal open onClose={onClose} size="lg">
        <div className="-mx-6 -my-5">
          <div className="relative aspect-[16/7] overflow-hidden bg-bg">
            {city.imageUrl ? (
              <img src={city.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">🌍</div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-5 text-white">
              <p className="font-hand text-2xl drop-shadow sm:text-3xl">{city.country}</p>
              <p className="font-display text-3xl font-bold drop-shadow sm:text-4xl">{city.name}</p>
            </div>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-4 w-4" />
                {city.region ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {city.popularity}% loved
              </span>
              <CostStamp cost={city.costIndex} />
            </div>

            {city.blurb && <p className="text-base text-text/90">{city.blurb}</p>}

            <div className="flex flex-wrap gap-2 border-y border-border py-4">
              <Button
                onClick={() => setAdding(true)}
                leadingIcon={<CalendarPlus className="h-4 w-4" strokeWidth={2.25} />}
              >
                Add to a trip
              </Button>
              <Button
                variant="secondary"
                onClick={toggleSaved}
                disabled={save.isPending || unsave.isPending}
                leadingIcon={
                  <Heart
                    className={cn("h-4 w-4", isSaved && "fill-primary text-primary")}
                    strokeWidth={2.25}
                  />
                }
              >
                {isSaved ? "Saved" : "Save for later"}
              </Button>
            </div>

            <div>
              <p className="font-display text-lg font-bold text-text">
                <Sparkles className="mr-1 inline-block h-4 w-4 text-gold" strokeWidth={2.25} />
                Things to do
              </p>
              <p className="text-sm text-muted">Pick a few, then add them to your trip stop.</p>

              <div className="mt-3">
                {activities.isLoading && <PageSpinner label="Loading activities…" />}
                {activities.isError && (
                  <ErrorBanner
                    title="Couldn't load activities"
                    message={(activities.error as Error).message}
                  />
                )}
                {activities.data && activities.data.length === 0 && (
                  <p className="rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-6 text-center text-sm text-muted">
                    No activities catalogued for this city yet.
                  </p>
                )}
                {activities.data && activities.data.length > 0 && (
                  <ul className="space-y-2">
                    {activities.data.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                      >
                        <Badge tone={typeTone[a.type]}>{a.type.toLowerCase()}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-semibold text-text">{a.name}</p>
                          {a.description && (
                            <p className="line-clamp-2 text-xs text-muted">{a.description}</p>
                          )}
                        </div>
                        <span className="hidden flex-shrink-0 items-center gap-1 text-xs text-muted sm:inline-flex">
                          <Clock className="h-3.5 w-3.5" />
                          {a.durationHours}h
                        </span>
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-display font-semibold text-text">
                          <Wallet className="h-4 w-4 text-gold" strokeWidth={2.25} />
                          {a.baseCost > 0 ? formatMoney(a.baseCost) : "Free"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {adding && (
        <AddCityToTripDialog
          city={city}
          open={adding}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

function CostStamp({ cost }: { cost: 1 | 2 | 3 | 4 }) {
  return (
    <span
      aria-label={`Cost index ${cost} of 4`}
      className="inline-flex items-center gap-0.5 rounded-md border-2 border-dashed border-gold/40 bg-gold/10 px-2 py-0.5 font-display text-xs font-bold text-gold"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={cn(i < cost ? "" : "opacity-25")}>
          $
        </span>
      ))}
    </span>
  );
}
