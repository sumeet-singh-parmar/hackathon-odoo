import { ReactNode } from "react";
import { NavLink as RouterNavLink } from "react-router";
import { cn } from "@/lib/cn";

interface NavLinkProps {
  to: string;
  end?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function NavLink({ to, end, icon, children, onClick }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 font-display text-sm font-semibold transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted hover:bg-bg hover:text-text",
        )
      }
    >
      {icon}
      <span>{children}</span>
    </RouterNavLink>
  );
}
