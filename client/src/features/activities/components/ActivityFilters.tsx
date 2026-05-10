import { ActivityTypeValues, type ActivityType } from "@hackathon/shared";
import { cn } from "@/lib/cn";

export interface ActivityFilterState {
  q: string;
  type: ActivityType | "ALL";
  maxCost: "ANY" | "FREE" | "50" | "100";
  maxDuration: "ANY" | "2" | "4" | "8";
}

export const initialActivityFilters: ActivityFilterState = {
  q: "",
  type: "ALL",
  maxCost: "ANY",
  maxDuration: "ANY",
};

interface ActivityFiltersProps {
  value: ActivityFilterState;
  onChange: (next: ActivityFilterState) => void;
}

const typeLabels: Record<ActivityType, string> = {
  SIGHTSEEING: "Sights",
  FOOD: "Food",
  ADVENTURE: "Adventure",
  NIGHTLIFE: "Nightlife",
  CULTURE: "Culture",
  NATURE: "Nature",
};

const costLabels: Record<ActivityFilterState["maxCost"], string> = {
  ANY: "Any cost",
  FREE: "Free",
  "50": "Up to $50",
  "100": "Up to $100",
};

const durationLabels: Record<ActivityFilterState["maxDuration"], string> = {
  ANY: "Any length",
  "2": "≤ 2 hr",
  "4": "≤ 4 hr",
  "8": "≤ 8 hr",
};

export function ActivityFilters({ value, onChange }: ActivityFiltersProps) {
  return (
    <div className="space-y-3">
      <input
        type="search"
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        placeholder="Search activities — temples, food tours, surf…"
        className="block w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base text-text placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
      />

      <FilterGroup label="Type">
        <Pill
          active={value.type === "ALL"}
          onClick={() => onChange({ ...value, type: "ALL" })}
        >
          All
        </Pill>
        {ActivityTypeValues.map((t) => (
          <Pill key={t} active={value.type === t} onClick={() => onChange({ ...value, type: t })}>
            {typeLabels[t]}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Cost">
        {(Object.keys(costLabels) as ActivityFilterState["maxCost"][]).map((c) => (
          <Pill
            key={c}
            active={value.maxCost === c}
            onClick={() => onChange({ ...value, maxCost: c })}
          >
            {costLabels[c]}
          </Pill>
        ))}
      </FilterGroup>

      <FilterGroup label="Duration">
        {(Object.keys(durationLabels) as ActivityFilterState["maxDuration"][]).map((d) => (
          <Pill
            key={d}
            active={value.maxDuration === d}
            onClick={() => onChange({ ...value, maxDuration: d })}
          >
            {durationLabels[d]}
          </Pill>
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-3.5 py-1 font-display text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-surface text-muted hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function filtersToQuery(f: ActivityFilterState) {
  return {
    q: f.q.trim() || undefined,
    type: f.type === "ALL" ? undefined : f.type,
    maxCost:
      f.maxCost === "ANY" ? undefined : f.maxCost === "FREE" ? 0 : Number(f.maxCost),
    maxDuration: f.maxDuration === "ANY" ? undefined : Number(f.maxDuration),
  };
}
