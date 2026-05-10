import { ReactNode, useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  Check,
  DollarSign,
  Globe2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type CitySortKey = "popularity" | "name" | "cost";
export type CostCap = 1 | 2 | 3 | 4;

interface SearchFilterBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
  sort: CitySortKey;
  onSortChange: (v: CitySortKey) => void;
  costMax?: CostCap;
  onCostMaxChange: (v: CostCap | undefined) => void;
  region?: string;
  onRegionChange: (v: string | undefined) => void;
  regions?: string[];
}

const sortOptions: { value: CitySortKey; label: string; hint: string }[] = [
  { value: "popularity", label: "Most popular", hint: "What other travellers are planning" },
  { value: "name", label: "A → Z", hint: "Alphabetical by city" },
  { value: "cost", label: "Cheapest first", hint: "By cost-of-living index" },
];

const sortLabel: Record<CitySortKey, string> = {
  popularity: "Popular",
  name: "Name",
  cost: "Cheapest",
};

const costOptions: { value: CostCap; label: string }[] = [
  { value: 1, label: "$" },
  { value: 2, label: "$$" },
  { value: 3, label: "$$$" },
  { value: 4, label: "$$$$" },
];

export function SearchFilterBar({
  value,
  onChange,
  placeholder = "Search...",
  loading,
  sort,
  onSortChange,
  costMax,
  onCostMaxChange,
  region,
  onRegionChange,
  regions = [],
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
            loading ? "text-primary" : "text-muted",
          )}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "block w-full rounded-xl border-2 border-border bg-surface pl-10 pr-4 py-2.5",
            "text-base text-text placeholder:text-muted/70",
            "transition-colors duration-150",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <PillDropdown
          icon={<ArrowDownUp className="h-4 w-4" strokeWidth={2.25} />}
          label="Sort"
          value={sortLabel[sort]}
        >
          {(close) => (
            <ul className="min-w-[14rem] py-1">
              {sortOptions.map((opt) => (
                <RadioRow
                  key={opt.value}
                  active={sort === opt.value}
                  label={opt.label}
                  hint={opt.hint}
                  onClick={() => {
                    onSortChange(opt.value);
                    close();
                  }}
                />
              ))}
            </ul>
          )}
        </PillDropdown>

        <PillDropdown
          icon={<DollarSign className="h-4 w-4" strokeWidth={2.25} />}
          label="Cost"
          value={costMax ? "$".repeat(costMax) + " or less" : undefined}
          onClear={costMax !== undefined ? () => onCostMaxChange(undefined) : undefined}
        >
          {(close) => (
            <ul className="min-w-[10rem] py-1">
              <RadioRow
                active={costMax === undefined}
                label="Any cost"
                onClick={() => {
                  onCostMaxChange(undefined);
                  close();
                }}
              />
              {costOptions.map((opt) => (
                <RadioRow
                  key={opt.value}
                  active={costMax === opt.value}
                  label={`${opt.label} or less`}
                  onClick={() => {
                    onCostMaxChange(opt.value);
                    close();
                  }}
                />
              ))}
            </ul>
          )}
        </PillDropdown>

        <PillDropdown
          icon={<Globe2 className="h-4 w-4" strokeWidth={2.25} />}
          label="Region"
          value={region}
          onClear={region ? () => onRegionChange(undefined) : undefined}
        >
          {(close) => (
            <ul className="min-w-[10rem] py-1">
              <RadioRow
                active={!region}
                label="All regions"
                onClick={() => {
                  onRegionChange(undefined);
                  close();
                }}
              />
              {regions.map((r) => (
                <RadioRow
                  key={r}
                  active={region === r}
                  label={r}
                  onClick={() => {
                    onRegionChange(r);
                    close();
                  }}
                />
              ))}
            </ul>
          )}
        </PillDropdown>
      </div>
    </div>
  );
}

function PillDropdown({
  icon,
  label,
  value,
  onClear,
  children,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClear?: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = value !== undefined;

  return (
    <div ref={ref} className="relative">
      <div className="flex">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl border-2 px-3 font-display text-sm font-semibold transition-colors",
            active
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface text-text hover:border-primary hover:text-primary",
            onClear && active ? "rounded-r-none border-r-0" : "",
          )}
        >
          <span className={active ? "text-primary" : "text-muted"}>{icon}</span>
          <span>
            {label}
            {value ? <span className="text-text/70">: {value}</span> : null}
          </span>
        </button>
        {onClear && active && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            aria-label={`Clear ${label}`}
            className="inline-flex h-10 items-center justify-center rounded-r-xl border-2 border-l border-primary bg-primary/10 px-2 text-primary hover:bg-primary/20"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-card"
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

function RadioRow({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="menuitemradio"
        aria-checked={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-2 px-4 py-2 text-left text-sm transition-colors",
          active ? "bg-primary/10 text-primary" : "text-text hover:bg-bg",
        )}
      >
        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
          {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span>
          <span className="font-display font-semibold">{label}</span>
          {hint && <span className="block text-xs text-muted">{hint}</span>}
        </span>
      </button>
    </li>
  );
}
