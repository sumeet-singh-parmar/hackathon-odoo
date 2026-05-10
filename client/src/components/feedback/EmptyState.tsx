import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border-2 border-dashed border-border/70 bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      {illustration && (
        <div className="mb-4 text-muted/70" aria-hidden="true">
          {illustration}
        </div>
      )}
      <p className="font-display text-xl font-semibold text-text">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
