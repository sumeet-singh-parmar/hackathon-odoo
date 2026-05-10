import { Route, Routes } from "react-router";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripsPage } from "@/pages/TripsPage";
import { CreateTripPage } from "@/pages/CreateTripPage";
import { TripPage } from "@/pages/TripPage";
import { PublicTripPage } from "@/pages/PublicTripPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/trips/new" element={<CreateTripPage />} />
      <Route path="/trips/:id" element={<TripPage />} />
      <Route path="/share/:token" element={<PublicTripPage />} />
    </Routes>
  );
}
