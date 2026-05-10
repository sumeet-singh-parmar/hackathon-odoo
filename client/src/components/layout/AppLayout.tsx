import { Outlet } from "react-router";
import { TopBar } from "@/components/layout/TopBar";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-bg">
      <TopBar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
