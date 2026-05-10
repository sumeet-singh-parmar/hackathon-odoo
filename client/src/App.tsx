import { Route, Routes } from "react-router";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripsPage } from "@/pages/TripsPage";
import { CreateTripPage } from "@/pages/CreateTripPage";
import { TripPage } from "@/pages/TripPage";
import { CitiesPage } from "@/pages/CitiesPage";
import { ActivitiesPage } from "@/pages/ActivitiesPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { InvoicePage } from "@/pages/InvoicePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminPage } from "@/pages/AdminPage";
import { PublicTripPage } from "@/pages/PublicTripPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/share/:token" element={<PublicTripPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:id" element={<TripPage />} />
          <Route path="/trips/:id/invoice" element={<InvoicePage />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
