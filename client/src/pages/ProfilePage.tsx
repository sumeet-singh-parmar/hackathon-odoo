import { Link } from "react-router";
import type { Trip } from "@hackathon/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/primitives/Card";
import { Avatar } from "@/components/primitives/Avatar";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { DangerZone } from "@/features/profile/components/DangerZone";
import { SavedDestinationsList } from "@/features/profile/components/SavedDestinationsList";
import { TripCard } from "@/features/trips/components/TripCard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTrips } from "@/features/trips/hooks/useTrips";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const trips = useTrips();
  if (loading) return <PageSpinner label="Loading profile…" />;
  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;
  const all = trips.data ?? [];
  const now = Date.now();
  const prePlanned = all
    .filter((t) => t.status !== "COMPLETED" && new Date(t.endDate).getTime() >= now)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, 6);
  const previous = all
    .filter((t) => t.status === "COMPLETED" || new Date(t.endDate).getTime() < now)
    .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate))
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader hand="hi there" title="Your profile" subtitle="The bits that show up across Traveloop." />

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} name={fullName} size="xl" />
          <div>
            <p className="font-display text-xl font-bold text-text">{fullName}</p>
            <p className="text-sm text-muted">@{user.username}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <div className="mt-6">
          <ProfileForm user={user} />
        </div>
      </Card>

      <TripSection
        hand="next up"
        title="Pre-planned trips"
        trips={prePlanned}
        emptyHint="Nothing planned yet."
        ctaTo="/trips/new"
        ctaLabel="Plan one"
      />

      <TripSection
        hand="memory lane"
        title="Previous trips"
        trips={previous}
        emptyHint="No completed trips yet — go make some memories."
      />

      <SavedDestinationsList />

      <DangerZone />
    </div>
  );
}

function TripSection({
  hand,
  title,
  trips,
  emptyHint,
  ctaTo,
  ctaLabel,
}: {
  hand: string;
  title: string;
  trips: Trip[];
  emptyHint: string;
  ctaTo?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <p className="font-hand text-xl text-primary">{hand}</p>
          <h2 className="font-display text-2xl font-bold leading-tight text-text">
            {title} <span className="ml-1 text-base font-normal text-muted">({trips.length})</span>
          </h2>
        </div>
        <span className="mb-1.5 flex-1 border-b-2 border-dashed border-border" />
      </div>

      {trips.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">{emptyHint}</p>
          {ctaTo && ctaLabel && (
            <Link
              to={ctaTo}
              className="mt-3 inline-block font-display text-sm font-semibold text-accent hover:underline"
            >
              {ctaLabel} →
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t, i) => (
            <TripCard key={t.id} trip={t} rotate={i % 3 === 0 ? "left" : i % 3 === 1 ? "right" : "none"} />
          ))}
        </div>
      )}
    </section>
  );
}
