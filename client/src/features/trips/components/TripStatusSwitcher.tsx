import { Pencil, Plane, Sparkles, Check } from "lucide-react";
import type { Trip, TripStatus } from "@hackathon/shared";
import { useToast } from "@/components/feedback/Toast";
import { useUpdateTrip } from "@/features/trips/hooks/useTrips";
import { cn } from "@/lib/cn";

interface TripStatusSwitcherProps {
  trip: Trip;
}

interface StatusOption {
  value: TripStatus;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "DRAFT",
    label: "Draft",
    hint: "Still figuring it out",
    icon: <Pencil className="h-4 w-4" strokeWidth={2.25} />,
  },
  {
    value: "PLANNED",
    label: "Planned",
    hint: "Locked in, ticket booked",
    icon: <Sparkles className="h-4 w-4" strokeWidth={2.25} />,
  },
  {
    value: "ONGOING",
    label: "On the road",
    hint: "Currently travelling",
    icon: <Plane className="h-4 w-4" strokeWidth={2.25} />,
  },
  {
    value: "COMPLETED",
    label: "Done",
    hint: "Trip wrapped, memories made",
    icon: <Check className="h-4 w-4" strokeWidth={2.25} />,
  },
];

export function TripStatusSwitcher({ trip }: TripStatusSwitcherProps) {
  const update = useUpdateTrip(trip.id);
  const { push } = useToast();
  const current = trip.status;

  async function setStatus(next: TripStatus) {
    if (next === current) return;
    try {
      await update.mutateAsync({ input: { status: next } });
      const label = STATUS_OPTIONS.find((o) => o.value === next)?.label ?? next;
      push({ variant: "success", title: "Status updated", message: label });
    } catch (err) {
      push({
        variant: "danger",
        title: "Couldn't update status",
        message: err instanceof Error ? err.message : "Try again",
      });
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-base font-bold text-text">Trip status</p>
        <p className="text-xs text-muted">
          Move the trip along as plans firm up.
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {STATUS_OPTIONS.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              disabled={update.isPending && !active}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl border-2 px-3 py-2.5 text-left transition-all",
                active
                  ? "border-primary bg-primary/5 shadow-[0_2px_0_0_rgb(199_72_52)]"
                  : "border-border bg-surface hover:border-primary/50 hover:bg-bg/40",
                update.isPending && !active && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-display text-sm font-semibold",
                  active ? "text-primary" : "text-text",
                )}
              >
                {opt.icon}
                {opt.label}
              </span>
              <span className="text-xs text-muted">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
