import { Send } from "lucide-react";
import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
} as const;

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-primary", className)} role="status">
      <Send
        className={cn(sizeMap[size], "animate-bounce")}
        strokeWidth={2.25}
        style={{ animationDuration: "1.1s" }}
      />
      {label ? (
        <span className="font-display text-sm text-muted">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}
