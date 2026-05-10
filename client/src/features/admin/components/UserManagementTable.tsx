import { useState } from "react";
import { Search } from "lucide-react";
import type { UserRole } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { Input } from "@/components/forms/Input";
import { Pagination } from "@/components/data-display/Pagination";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { useToast } from "@/components/feedback/Toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserRow } from "@/features/admin/components/UserRow";
import {
  useAdminUsers,
  useDeleteUser,
  useSetUserRole,
} from "@/features/admin/hooks/useAdmin";

const PAGE_SIZE = 8;

export function UserManagementTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const users = useAdminUsers(page, PAGE_SIZE, query);
  const setRole = useSetUserRole();
  const remove = useDeleteUser();
  const { user: me } = useAuth();
  const { push } = useToast();

  if (users.isLoading) return <PageSpinner label="Loading users…" />;
  if (users.isError) return <ErrorBanner title="Couldn't load users" message={(users.error as Error).message} />;

  const data = users.data;
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  async function handleChangeRole(id: number, role: UserRole) {
    try {
      await setRole.mutateAsync({ id, role });
      push({ variant: "success", title: `Role updated to ${role}` });
    } catch (err) {
      push({ variant: "danger", title: "Couldn't update", message: err instanceof Error ? err.message : "" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await remove.mutateAsync(id);
      push({ variant: "success", title: "User deleted" });
    } catch (err) {
      push({ variant: "danger", title: "Couldn't delete", message: err instanceof Error ? err.message : "" });
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border p-4">
        <Input
          label=""
          placeholder="Search by name, username, or email"
          leadingIcon={<Search className="h-5 w-5" />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-bg/40 text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email · location</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No users match.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  currentUserId={me?.id}
                  onChangeRole={handleChangeRole}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border p-4">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </Card>
  );
}
