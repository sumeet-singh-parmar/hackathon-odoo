import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Wallet, MapPin, Receipt, Backpack, StickyNote } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { Tabs } from "@/components/navigation/Tabs";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { TripShareCard } from "@/features/trips/components/TripShareCard";
import { TripStatusSwitcher } from "@/features/trips/components/TripStatusSwitcher";
import { ItineraryBuilder } from "@/features/itinerary/components/ItineraryBuilder";
import { BudgetSummary } from "@/features/budget/components/BudgetSummary";
import { BudgetByCategory } from "@/features/budget/components/BudgetByCategory";
import { BudgetByDay } from "@/features/budget/components/BudgetByDay";
import { useBudget } from "@/features/budget/hooks/useBudget";
import { PackingChecklist } from "@/features/packing/components/PackingChecklist";
import { NotesList } from "@/features/notes/components/NotesList";
import { formatDateRange, formatMoney, daysBetween } from "@/lib/format";

type Tab = "itinerary" | "budget" | "packing" | "notes";

export function TripPage() {
  const { id } = useParams();
  const tripId = id ? Number(id) : undefined;
  const trip = useTrip(tripId);
  const [tab, setTab] = useState<Tab>("itinerary");

  if (trip.isLoading) return <PageSpinner label="Loading trip…" />;
  if (trip.isError || !trip.data)
    return <ErrorBanner title="Trip not found" message={(trip.error as Error)?.message ?? "Try going back to your trips."} />;

  const t = trip.data;
  const days = daysBetween(t.startDate, t.endDate);

  return (
    <div className="space-y-6">
      <Link
        to="/trips"
        className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        All trips
      </Link>

      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[21/9] bg-bg sm:aspect-[21/7]">
          {t.coverUrl ? (
            <img src={t.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl">🗺️</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent px-6 pb-6 pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold" stamp>
                {t.status}
              </Badge>
              <Badge tone="primary" stamp>
                {t.visibility}
              </Badge>
            </div>
            <h1 className="mt-3 font-hand text-4xl text-white sm:text-6xl">{t.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDateRange(t.startDate, t.endDate)} · {days} days
              </span>
              {t.budget != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Budget {formatMoney(t.budget, t.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
        {t.description && (
          <p className="border-t border-border px-6 py-4 text-base text-text/85">{t.description}</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <TripStatusSwitcher trip={t} />
        <TripShareCard trip={t} />
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { value: "itinerary", label: "Itinerary", icon: <MapPin className="h-4 w-4" /> },
          { value: "budget", label: "Budget", icon: <Receipt className="h-4 w-4" /> },
          { value: "packing", label: "Packing", icon: <Backpack className="h-4 w-4" /> },
          { value: "notes", label: "Notes", icon: <StickyNote className="h-4 w-4" /> },
        ]}
      />

      <div>
        {tab === "itinerary" && <ItineraryBuilder trip={t} />}
        {tab === "budget" && <BudgetTab tripId={t.id} />}
        {tab === "packing" && <PackingChecklist trip={t} />}
        {tab === "notes" && <NotesList trip={t} />}
      </div>
    </div>
  );
}

function BudgetTab({ tripId }: { tripId: number }) {
  const budget = useBudget(tripId);
  if (budget.isLoading) return <PageSpinner label="Loading budget…" />;
  if (budget.isError || !budget.data)
    return <ErrorBanner title="Couldn't load budget" message={(budget.error as Error)?.message ?? ""} />;

  return (
    <div className="space-y-4">
      <BudgetSummary budget={budget.data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetByCategory budget={budget.data} />
        <BudgetByDay budget={budget.data} />
      </div>
    </div>
  );
}
