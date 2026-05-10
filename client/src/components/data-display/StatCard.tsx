import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "gold" | "success";
  className?: string;
}

const tones = {
  primary: "text-primary bg-primary/10",
  accent: "text-accent bg-accent/15",
  gold: "text-gold bg-gold/15",
  success: "text-success bg-success/15",
} as const;

export function StatCard({ label, value, hint, icon, tone = "primary", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-3xl border border-border bg-surface p-5 shadow-card",
        className,
      )}
    >
      {icon && (
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tones[tone])}>
          {icon}
        </span>
      )}
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <span className="mt-1 font-display text-3xl font-bold text-text">{value}</span>
        {hint && <span className="mt-1 text-xs text-muted">{hint}</span>}
      </div>
    </div>
  );
}
