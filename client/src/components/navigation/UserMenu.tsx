import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, LogOut, Shield, UserRound } from "lucide-react";
import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-transparent bg-bg px-2 py-1.5 transition-colors hover:border-border"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.avatarUrl} name={fullName} size="sm" />
        <span className="hidden font-display text-sm font-semibold text-text sm:inline">
          {user.firstName}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-card"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="font-display text-sm font-semibold text-text">{fullName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <MenuItem
            icon={<UserRound className="h-4 w-4" />}
            label="Profile"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
          />
          {user.role === "ADMIN" && (
            <MenuItem
              icon={<Shield className="h-4 w-4" />}
              label="Admin"
              onClick={() => {
                setOpen(false);
                navigate("/admin");
              }}
            />
          )}
          <MenuItem
            icon={<LogOut className="h-4 w-4" />}
            label="Sign out"
            tone="danger"
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        tone === "danger"
          ? "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5"
          : "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text hover:bg-bg"
      }
    >
      <span className="text-muted">{icon}</span>
      <span className="font-display font-semibold">{label}</span>
    </button>
  );
}
