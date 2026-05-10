import { Heart, X } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import {
  useSavedDestinations,
  useUnsaveDestination,
} from "@/features/profile/hooks/useSavedDestinations";

export function SavedDestinationsList() {
  const saved = useSavedDestinations();
  const unsave = useUnsaveDestination();
  const { push } = useToast();

  async function handleRemove(cityId: number, name: string) {
    try {
      await unsave.mutateAsync(cityId);
      push({ variant: "info", title: "Removed", message: name });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't remove",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" strokeWidth={2.25} />
        <p className="font-display text-lg font-bold text-text">Saved destinations</p>
      </div>
      <p className="mt-1 text-sm text-muted">Cities you bookmarked from the Explore tab.</p>

      <div className="mt-4">
        {saved.isLoading && <PageSpinner label="Loading saved…" />}
        {saved.isError && (
          <ErrorBanner title="Couldn't load saved" message={(saved.error as Error).message} />
        )}
        {saved.data && saved.data.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-6 text-center text-sm text-muted">
            Nothing saved yet. Tap the heart on any city in Explore.
          </p>
        )}
        {saved.data && saved.data.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {saved.data.map((s) => (
              <li
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-24 flex-shrink-0 overflow-hidden bg-bg">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🌍</div>
                    )}
                  </div>
                  <div className="flex-1 py-2 pr-2">
                    <p className="font-display font-semibold text-text">{s.cityName}</p>
                    <p className="text-xs text-muted">{s.country}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(s.cityId, s.cityName)}
                    aria-label={`Remove ${s.cityName}`}
                    className="m-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
