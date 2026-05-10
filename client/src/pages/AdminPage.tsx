import { PageHeader } from "@/components/layout/PageHeader";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { AdminTotalsRow } from "@/features/admin/components/AdminTotalsRow";
import { AdminTopCities } from "@/features/admin/components/AdminTopCities";
import { AdminTopActivities } from "@/features/admin/components/AdminTopActivities";
import { AdminRecentLists } from "@/features/admin/components/AdminRecentLists";
import { UserManagementTable } from "@/features/admin/components/UserManagementTable";
import { useAdminAnalytics } from "@/features/admin/hooks/useAdmin";

export function AdminPage() {
  const analytics = useAdminAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        hand="control room"
        title="Admin"
        subtitle="Platform health, who's signing up, and what they're planning."
      />

      {analytics.isLoading && <PageSpinner label="Loading analytics…" />}
      {analytics.isError && (
        <ErrorBanner
          title="Couldn't load analytics"
          message={(analytics.error as Error).message}
        />
      )}

      {analytics.data && (
        <>
          <AdminTotalsRow
            totals={analytics.data.totals}
            averageTripBudget={analytics.data.averageTripBudget}
            averageTripDays={analytics.data.averageTripDays}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminTopCities cities={analytics.data.topCities} />
            <AdminTopActivities activities={analytics.data.topActivities} />
          </div>
          <AdminRecentLists
            recentUsers={analytics.data.recentUsers}
            recentTrips={analytics.data.recentTrips}
          />
        </>
      )}

      <UserManagementTable />
    </div>
  );
}
