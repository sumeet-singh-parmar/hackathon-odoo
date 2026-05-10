import { Trash2, Shield, ShieldOff } from "lucide-react";
import type { AdminUser, UserRole } from "@hackathon/shared";
import { Avatar } from "@/components/primitives/Avatar";
import { Badge } from "@/components/primitives/Badge";
import { formatRelative } from "@/lib/format";

interface UserRowProps {
  user: AdminUser;
  currentUserId?: number;
  onChangeRole: (id: number, role: UserRole) => void;
  onDelete: (id: number) => void;
}

export function UserRow({ user, currentUserId, onChangeRole, onDelete }: UserRowProps) {
  const isSelf = user.id === currentUserId;
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatarUrl} name={fullName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-text">{fullName}</p>
            <p className="truncate text-xs text-muted">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-sm text-text">{user.email}</p>
        <p className="truncate text-xs text-muted">
          {user.city}, {user.country}
        </p>
      </td>
      <td className="px-4 py-3">
        <Badge tone={user.role === "ADMIN" ? "primary" : "neutral"}>{user.role}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        {user.lastLoginAt ? formatRelative(user.lastLoginAt) : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            disabled={isSelf}
            onClick={() => onChangeRole(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")}
            className="inline-flex items-center gap-1 rounded-lg border-2 border-border px-2 py-1 text-xs font-display font-semibold text-text hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {user.role === "ADMIN" ? (
              <>
                <ShieldOff className="h-3.5 w-3.5" />
                Demote
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5" />
                Promote
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isSelf}
            onClick={() => onDelete(user.id)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-display font-semibold text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
