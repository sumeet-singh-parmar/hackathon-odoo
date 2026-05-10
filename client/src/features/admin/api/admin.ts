import type {
  AdminStats,
  AdminStatsResponse,
  AdminUser,
  Paginated,
  UserRole,
} from "@hackathon/shared";
import { api } from "@/lib/api";

export async function getStats(): Promise<AdminStats> {
  return api<AdminStats>("/api/admin/stats");
}

export async function getAnalytics(): Promise<AdminStatsResponse> {
  return api<AdminStatsResponse>("/api/admin/analytics");
}

export async function listUsers(
  page = 1,
  pageSize = 10,
  query = "",
): Promise<Paginated<AdminUser>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (query) params.set("q", query);
  return api<Paginated<AdminUser>>(`/api/admin/users?${params.toString()}`);
}

export async function setUserRole(id: number, role: UserRole): Promise<AdminUser> {
  return api<AdminUser>(`/api/admin/users/${id}`, { method: "PATCH", body: { role } });
}

export async function deleteUser(id: number): Promise<void> {
  await api<void>(`/api/admin/users/${id}`, { method: "DELETE" });
}
