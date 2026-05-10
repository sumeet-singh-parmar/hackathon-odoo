import { useState } from "react";
import { Link } from "react-router";
import { NavLink as RouterNavLink } from "react-router";
import { Plane, Compass, Map, LayoutDashboard, Sparkles, Users, Menu, X } from "lucide-react";
import { NavLink } from "@/components/navigation/NavLink";
import { UserMenu } from "@/components/navigation/UserMenu";
import { cn } from "@/lib/cn";

export function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-text">
          <span className="inline-flex h-9 w-9 -rotate-12 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-[0_2px_0_0_rgb(199_72_52)]">
            <Plane className="h-5 w-5" strokeWidth={2.5} />
          </span>
          Traveloop
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <NavLink to="/" end icon={<LayoutDashboard className="h-4 w-4" strokeWidth={2.25} />}>
            Dashboard
          </NavLink>
          <NavLink to="/trips" icon={<Map className="h-4 w-4" strokeWidth={2.25} />}>
            My trips
          </NavLink>
          <NavLink to="/cities" icon={<Compass className="h-4 w-4" strokeWidth={2.25} />}>
            Cities
          </NavLink>
          <NavLink to="/activities" icon={<Sparkles className="h-4 w-4" strokeWidth={2.25} />}>
            Activities
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <RouterNavLink
            to="/community"
            aria-label="Community"
            title="Community"
            className={({ isActive }) =>
              cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-border bg-surface text-text hover:border-primary hover:text-primary",
              )
            }
          >
            <Users className="h-5 w-5" strokeWidth={2.25} />
          </RouterNavLink>
          <UserMenu />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "border-t border-border bg-surface md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1 p-3">
          <NavLink to="/" end onClick={() => setOpen(false)} icon={<LayoutDashboard className="h-4 w-4" strokeWidth={2.25} />}>
            Dashboard
          </NavLink>
          <NavLink to="/trips" onClick={() => setOpen(false)} icon={<Map className="h-4 w-4" strokeWidth={2.25} />}>
            My trips
          </NavLink>
          <NavLink to="/cities" onClick={() => setOpen(false)} icon={<Compass className="h-4 w-4" strokeWidth={2.25} />}>
            Cities
          </NavLink>
          <NavLink to="/activities" onClick={() => setOpen(false)} icon={<Sparkles className="h-4 w-4" strokeWidth={2.25} />}>
            Activities
          </NavLink>
          <NavLink to="/community" onClick={() => setOpen(false)} icon={<Users className="h-4 w-4" strokeWidth={2.25} />}>
            Community
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
