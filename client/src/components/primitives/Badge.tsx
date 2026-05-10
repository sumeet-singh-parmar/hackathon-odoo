import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "gold";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  stamp?: boolean;
  leadingIcon?: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-bg text-text border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/15 text-accent border-accent/25",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-danger/15 text-danger border-danger/25",
  gold: "bg-gold/20 text-gold border-gold/30",
};

export function Badge({
  tone = "neutral",
  stamp = false,
  leadingIcon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-display font-semibold uppercase tracking-wide",
        stamp
          ? "rounded-md px-2.5 py-1 text-[0.7rem] -rotate-3 border-2 border-dashed"
          : "rounded-full px-3 py-1 text-xs",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
    </span>
  );
}
