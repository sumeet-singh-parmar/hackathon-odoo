import { Check, Trash2 } from "lucide-react";
import type { PackingItem } from "@hackathon/shared";
import { cn } from "@/lib/cn";

interface PackingItemRowProps {
  item: PackingItem;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}

export function PackingItemRow({ item, onToggle, onRemove }: PackingItemRowProps) {
  return (
    <li className="flex items-center gap-3 px-1 py-1.5">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={item.packed}
        aria-label={item.packed ? `Unpack ${item.name}` : `Mark ${item.name} as packed`}
        className={cn(
          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          item.packed
            ? "border-success bg-success text-white"
            : "border-border bg-surface hover:border-primary",
        )}
      >
        {item.packed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          item.packed ? "text-muted line-through" : "text-text",
        )}
      >
        {item.name}
      </span>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
