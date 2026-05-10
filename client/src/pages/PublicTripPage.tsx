import { Link, useParams } from "react-router";
import { Plane } from "lucide-react";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { PublicTripView } from "@/features/share/components/PublicTripView";
import { useSharedTrip } from "@/features/share/hooks/useSharedTrip";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserMenu } from "@/components/navigation/UserMenu";

export function PublicTripPage() {
  const { token } = useParams();
  const trip = useSharedTrip(token);
  const { user, loading: authLoading } = useAuth();

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-text">
            <span className="inline-flex h-9 w-9 -rotate-12 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-[0_2px_0_0_rgb(199_72_52)]">
              <Plane className="h-5 w-5" strokeWidth={2.5} />
            </span>
            Traveloop
          </Link>
          {authLoading ? null : user ? (
            <UserMenu />
          ) : (
            <Link
              to="/signup"
              className="font-display text-sm font-semibold text-accent hover:underline"
            >
              Make your own →
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {trip.isLoading && <PageSpinner label="Loading trip…" />}
        {trip.isError && (
          <ErrorBanner title="Couldn't load this trip" message={(trip.error as Error).message} />
        )}
        {trip.data && <PublicTripView trip={trip.data} />}
      </main>
    </div>
  );
}
