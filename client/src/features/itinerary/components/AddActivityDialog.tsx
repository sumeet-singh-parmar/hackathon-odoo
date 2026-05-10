import { useState } from "react";
import { Clock, Sparkles, Wallet } from "lucide-react";
import type { Stop } from "@hackathon/shared";
import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import { useActivityCatalog } from "@/features/cities/hooks/useCities";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney } from "@/lib/format";

interface AddActivityDialogProps {
  stop: Stop;
  open: boolean;
  onClose: () => void;
}

export function AddActivityDialog({ stop, open, onClose }: AddActivityDialogProps) {
  const catalog = useActivityCatalog(stop.cityId);
  const { push } = useToast();
  const qc = useQueryClient();
  const [pinningId, setPinningId] = useState<number | null>(null);

  async function pin(activityId: number) {
    setPinningId(activityId);
    try {
      await api(`/api/stops/${stop.id}/activities`, {
        method: "POST",
        body: { activityId },
      });
      qc.invalidateQueries({ queryKey: ["activities", stop.id] });
      qc.invalidateQueries({ queryKey: ["stops", stop.tripId] });
      push({ variant: "success", title: "Activity pinned" });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't pin",
        message: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setPinningId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Add to ${stop.cityName}`}
      description="Pick from the city's activity catalog. Pinned activities show up on this stop."
    >
      {catalog.isLoading && <PageSpinner label="Loading activities…" />}
      {catalog.isError && (
        <ErrorBanner title="Couldn't load activities" message={(catalog.error as Error).message} />
      )}
      {catalog.data && catalog.data.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-border bg-bg/40 px-4 py-6 text-center text-sm text-muted">
          No activities catalogued for {stop.cityName} yet.
        </p>
      )}
      {catalog.data && catalog.data.length > 0 && (
        <ul className="space-y-2">
          {catalog.data.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <Badge tone="primary">{a.type.toLowerCase()}</Badge>
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
              <span className="hidden flex-shrink-0 items-center gap-1 text-sm font-display font-semibold text-text sm:inline-flex">
                <Wallet className="h-4 w-4 text-gold" />
                {a.baseCost > 0 ? formatMoney(a.baseCost) : "Free"}
              </span>
              <Button
                size="sm"
                variant="secondary"
                loading={pinningId === a.id}
                onClick={() => pin(a.id)}
                leadingIcon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />}
              >
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
