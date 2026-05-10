import { Navigate, Outlet } from "react-router";
import type { UserRole } from "@hackathon/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PageSpinner } from "@/components/primitives/Spinner";

interface RequireRoleProps {
  role: UserRole;
}

export function RequireRole({ role }: RequireRoleProps) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
