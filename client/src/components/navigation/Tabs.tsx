import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
  className?: string;
}

export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border-2 border-border bg-surface p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 font-display text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-fg shadow-[0_2px_0_0_rgb(199_72_52)]"
                : "text-muted hover:bg-bg hover:text-text",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && <span className="ml-1">{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
