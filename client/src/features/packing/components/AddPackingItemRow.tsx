import { useState } from "react";
import { Plus } from "lucide-react";
import type { ClientPackingCategory } from "@hackathon/shared";

interface AddPackingItemRowProps {
  category: ClientPackingCategory;
  onAdd: (name: string, category: ClientPackingCategory) => Promise<void> | void;
}

export function AddPackingItemRow({ category, onAdd }: AddPackingItemRowProps) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await onAdd(trimmed, category);
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add item…"
        className="flex-1 rounded-xl border-2 border-dashed border-border bg-transparent px-3 py-1.5 text-sm placeholder:text-muted/70 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-[0_2px_0_0_rgb(199_72_52)] disabled:opacity-50"
        aria-label="Add item"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </form>
  );
}
