import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PolaroidCardProps {
  cover: ReactNode;
  rotate?: "left" | "right" | "none";
  children: ReactNode;
  className?: string;
}

const rotations = {
  left: "-rotate-1",
  right: "rotate-1",
  none: "rotate-0",
} as const;

export function PolaroidCard({ cover, rotate = "left", children, className }: PolaroidCardProps) {
  return (
    <div
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-card transition-transform",
        "hover:rotate-0 hover:-translate-y-1",
        rotations[rotate],
        className,
      )}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-bg">{cover}</div>
      <div className="px-1 pt-3 pb-1">{children}</div>
    </div>
  );
}
