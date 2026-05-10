import { Plus } from "lucide-react";

interface AddStopButtonProps {
  onClick: () => void;
  label?: string;
}

export function AddStopButton({ onClick, label = "Add a stop" }: AddStopButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-bg/50 py-5 font-display text-sm font-semibold text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-current">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {label}
    </button>
  );
}
