import { RotateCcw } from "lucide-react";
import type { Trip, ClientPackingCategory } from "@hackathon/shared";
import { PackingCategorySection } from "@/features/packing/components/PackingCategorySection";
import { Button } from "@/components/primitives/Button";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import {
  usePackingList,
  useAddPackingItem,
  useTogglePackingItem,
  useRemovePackingItem,
  useResetPacking,
} from "@/features/packing/hooks/usePackingList";

const order: ClientPackingCategory[] = [
  "DOCUMENTS",
  "CLOTHING",
  "ELECTRONICS",
  "TOILETRIES",
  "HEALTH",
  "MISC",
];

export function PackingChecklist({ trip }: { trip: Trip }) {
  const list = usePackingList(trip.id);
  const add = useAddPackingItem(trip.id);
  const toggle = useTogglePackingItem(trip.id);
  const remove = useRemovePackingItem(trip.id);
  const reset = useResetPacking(trip.id);
  const { push } = useToast();

  if (list.isLoading) return <PageSpinner label="Loading packing list…" />;
  if (list.isError)
    return <ErrorBanner title="Couldn't load packing" message={(list.error as Error).message} />;

  const items = list.data ?? [];
  const totalPacked = items.filter((i) => i.packed).length;

  async function handleReset() {
    if (!confirm("Mark every item as unpacked? You'll have to re-tick everything.")) return;
    try {
      await reset.mutateAsync();
      push({ variant: "success", title: "Checklist reset" });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't reset",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-surface/40 px-4 py-3">
        <span className="font-display text-sm font-semibold text-text">
          Packed {totalPacked} of {items.length}
        </span>
        <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{
              width: items.length === 0 ? "0%" : `${(totalPacked / items.length) * 100}%`,
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={totalPacked === 0 || reset.isPending}
          onClick={handleReset}
          leadingIcon={<RotateCcw className="h-4 w-4" strokeWidth={2.25} />}
          className="ml-auto"
        >
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {order.map((cat) => (
          <PackingCategorySection
            key={cat}
            category={cat}
            items={items.filter((i) => i.category === cat)}
            onToggle={(id) => toggle.mutate(id)}
            onRemove={(id) => remove.mutate(id)}
            onAdd={async (name, category) => {
              await add.mutateAsync({ name, category });
            }}
          />
        ))}
      </div>
    </div>
  );
}
