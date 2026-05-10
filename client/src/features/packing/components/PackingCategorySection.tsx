import { FileText, Shirt, Plug, Sparkles, HeartPulse, Package } from "lucide-react";
import type { PackingItem, ClientPackingCategory } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { PackingItemRow } from "@/features/packing/components/PackingItemRow";
import { AddPackingItemRow } from "@/features/packing/components/AddPackingItemRow";

interface Props {
  category: ClientPackingCategory;
  items: PackingItem[];
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onAdd: (name: string, category: ClientPackingCategory) => Promise<void> | void;
}

export const categoryMeta: Record<ClientPackingCategory, { label: string; icon: React.ReactNode }> = {
  DOCUMENTS: { label: "Documents", icon: <FileText className="h-4 w-4" /> },
  CLOTHING: { label: "Clothing", icon: <Shirt className="h-4 w-4" /> },
  ELECTRONICS: { label: "Electronics", icon: <Plug className="h-4 w-4" /> },
  TOILETRIES: { label: "Toiletries", icon: <Sparkles className="h-4 w-4" /> },
  HEALTH: { label: "Health", icon: <HeartPulse className="h-4 w-4" /> },
  MISC: { label: "Misc", icon: <Package className="h-4 w-4" /> },
};

export function PackingCategorySection({ category, items, onToggle, onRemove, onAdd }: Props) {
  const meta = categoryMeta[category];
  const packedCount = items.filter((i) => i.packed).length;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {meta.icon}
        </span>
        <p className="font-display text-lg font-bold text-text">{meta.label}</p>
        <span className="ml-auto text-xs text-muted">
          {packedCount}/{items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 divide-y divide-border/60">
          {items.map((item) => (
            <PackingItemRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing here yet.</p>
      )}

      <AddPackingItemRow category={category} onAdd={onAdd} />
    </Card>
  );
}
