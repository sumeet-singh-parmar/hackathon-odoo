import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, FileDown, BadgeCheck, Receipt } from "lucide-react";
import type { Budget, TripStatus } from "@hackathon/shared";
import { PageSpinner } from "@/components/primitives/Spinner";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { PieBreakdown } from "@/components/charts/PieBreakdown";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { useBudget } from "@/features/budget/hooks/useBudget";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDateRange, formatMoney } from "@/lib/format";

const TAX_RATE = 0.05;
const DISCOUNT = 50; // demo discount line, swap when backend lands

const categoryLabels = {
  TRANSPORT: "Transport",
  STAY: "Stay",
  FOOD: "Food",
  ACTIVITIES: "Activities",
  MISC: "Misc",
} as const;

const statusToPayment: Record<TripStatus, { label: string; tone: "neutral" | "warning" | "success" | "primary" }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  PLANNED: { label: "Pending", tone: "warning" },
  ONGOING: { label: "Pending", tone: "warning" },
  COMPLETED: { label: "Paid", tone: "success" },
};

export function InvoicePage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const trip = useTrip(id);
  const budget = useBudget(id);

  if (!id || trip.isLoading || budget.isLoading) return <PageSpinner label="Loading invoice…" />;
  if (trip.isError) return <ErrorBanner title="Couldn't load trip" message={(trip.error as Error).message} />;
  if (!trip.data) return null;

  const t = trip.data;
  const b = budget.data;

  const lineItems = b ? toLineItems(b) : [];
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const grandTotal = Math.max(0, subtotal + tax - DISCOUNT);

  const remaining = b?.budgetLimit != null ? b.budgetLimit - (b.total ?? 0) : null;
  const overBudget = remaining != null && remaining < 0;
  const payment = statusToPayment[t.status];
  const generatedDate = new Date().toISOString().slice(0, 10);
  const invoiceId = `INV-${String(t.id).padStart(4, "0")}-${generatedDate.replace(/-/g, "")}`;

  const traveler = user
    ? `${user.firstName} ${user.lastName}`
    : "Trip owner";

  return (
    <div className="space-y-6">
      <Link
        to={`/trips/${t.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to trip
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-bg sm:w-44 sm:flex-shrink-0">
                {t.coverUrl ? (
                  <img src={t.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">✈</div>
                )}
              </div>

              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-hand text-xl text-primary">invoice for</p>
                  <p className="font-display text-xl font-bold text-text">{t.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{formatDateRange(t.startDate, t.endDate)}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <KV label="Invoice ID" value={invoiceId} />
                  <KV label="Generated" value={generatedDate} />
                  <KV label="Currency" value={t.currency} />
                </div>
                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">Traveller</p>
                  <p className="mt-1 text-sm text-text">{traveler}</p>
                  <p className="text-xs text-muted">@{user?.username}</p>
                </div>
                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">Payment status</p>
                  <Badge tone={payment.tone} stamp className="mt-1">
                    {payment.label}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-border bg-bg/40 font-display text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Unit cost</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        No line items yet — add expenses on the budget tab.
                      </td>
                    </tr>
                  )}
                  {lineItems.map((row, i) => (
                    <tr key={row.category} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted">{i + 1}</td>
                      <td className="px-4 py-3 font-display font-semibold text-text">{row.label}</td>
                      <td className="px-4 py-3 text-muted">{row.description}</td>
                      <td className="px-4 py-3 text-right text-muted">{row.qty}</td>
                      <td className="px-4 py-3 text-right text-muted">{formatMoney(row.unit, t.currency)}</td>
                      <td className="px-4 py-3 text-right font-display font-semibold text-text">
                        {formatMoney(row.amount, t.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-bg/40 font-display">
                  <TotalsRow label="Subtotal" value={formatMoney(subtotal, t.currency)} />
                  <TotalsRow label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} value={formatMoney(tax, t.currency)} />
                  <TotalsRow label="Discount" value={`-${formatMoney(DISCOUNT, t.currency)}`} />
                  <TotalsRow label="Grand total" value={formatMoney(grandTotal, t.currency)} bold />
                </tfoot>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Download className="h-4 w-4" strokeWidth={2.25} />}
              onClick={() => window.print()}
            >
              Download invoice
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<FileDown className="h-4 w-4" strokeWidth={2.25} />}
              onClick={() => window.print()}
            >
              Export as PDF
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              leadingIcon={<BadgeCheck className="h-4 w-4" strokeWidth={2.25} />}
              disabled={t.status === "COMPLETED"}
            >
              {t.status === "COMPLETED" ? "Paid" : "Mark as paid"}
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-accent" strokeWidth={2.25} />
              <p className="font-display text-base font-bold text-text">Budget insights</p>
            </div>

            <BudgetSummaryRow label="Total budget" value={b?.budgetLimit ?? null} currency={t.currency} />
            <BudgetSummaryRow label="Total spent" value={b?.total ?? null} currency={t.currency} />
            <div className="my-3 border-t border-border" />
            <BudgetSummaryRow
              label="Remaining"
              value={remaining}
              currency={t.currency}
              tone={overBudget ? "danger" : "success"}
            />

            {b && b.byCategory.length > 0 && (
              <div className="mt-4">
                <PieBreakdown
                  data={b.byCategory.map((c) => ({
                    name: categoryLabels[c.category],
                    value: c.amount,
                  }))}
                  formatValue={(v) => formatMoney(v, t.currency)}
                />
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="mt-4"
              onClick={() => navigate(`/trips/${t.id}`)}
            >
              View full budget
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

interface LineItem {
  category: string;
  label: string;
  description: string;
  qty: string;
  unit: number;
  amount: number;
}

function toLineItems(b: Budget): LineItem[] {
  return b.byCategory
    .filter((c) => c.amount > 0)
    .map((c) => ({
      category: c.category,
      label: categoryLabels[c.category],
      description: descriptionFor(c.category),
      qty: "—",
      unit: c.amount,
      amount: c.amount,
    }));
}

function descriptionFor(cat: keyof typeof categoryLabels): string {
  switch (cat) {
    case "TRANSPORT": return "Flights, trains, taxis";
    case "STAY": return "Hotels, hostels, rentals";
    case "FOOD": return "Meals, snacks, drinks";
    case "ACTIVITIES": return "Tours, tickets, experiences";
    default: return "Other expenses";
  }
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-baseline justify-between gap-3">
      <span className="text-xs font-display font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className="text-sm text-text">{value}</span>
    </p>
  );
}

function TotalsRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-t border-border">
      <td colSpan={4} />
      <td className={`px-4 py-2.5 text-right ${bold ? "font-bold text-text" : "text-muted"}`}>{label}</td>
      <td className={`px-4 py-2.5 text-right ${bold ? "text-lg font-bold text-primary" : "font-semibold text-text"}`}>
        {value}
      </td>
    </tr>
  );
}

function BudgetSummaryRow({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number | null;
  currency: string;
  tone?: "danger" | "success";
}) {
  const colour = tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-text";
  return (
    <p className="flex items-baseline justify-between py-1">
      <span className="text-xs font-display font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className={`font-display text-base font-bold ${colour}`}>
        {value == null ? "—" : formatMoney(value, currency)}
      </span>
    </p>
  );
}
