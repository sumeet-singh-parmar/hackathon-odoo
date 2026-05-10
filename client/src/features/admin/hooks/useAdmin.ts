import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@hackathon/shared";
import * as adminApi from "@/features/admin/api/admin";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminApi.getStats });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ["admin", "analytics"], queryFn: adminApi.getAnalytics });
}

export function useAdminUsers(page: number, pageSize: number, query = "") {
  return useQuery({
    queryKey: ["admin", "users", page, pageSize, query],
    queryFn: () => adminApi.listUsers(page, pageSize, query),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => adminApi.setUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
