import { ReactNode } from "react";
import { Plane } from "lucide-react";
import { AuthIllustration } from "@/features/auth/components/AuthIllustration";

interface AuthLayoutProps {
  title: string;
  tagline?: string;
  hand?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, tagline, hand, children, footer }: AuthLayoutProps) {
  return (
    <div className="fixed inset-0 grid overflow-hidden lg:grid-cols-2">
      <aside className="relative hidden h-full overflow-hidden bg-gradient-to-br from-[rgb(255,233,205)] to-[rgb(255,210,170)] lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="relative z-10 flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <span className="inline-flex h-9 w-9 -rotate-12 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-soft">
            <Plane className="h-5 w-5" strokeWidth={2.5} />
          </span>
          Traveloop
        </div>

        <div className="absolute inset-0 z-0">
          <AuthIllustration />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-hand text-3xl text-ink">plan it. live it. share it.</p>
          <p className="mt-2 text-base text-ink/70">
            multi-city itineraries, real budgets, your own paper journal — but online.
          </p>
        </div>
      </aside>

      <main className="h-full overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-ink lg:hidden">
              <span className="inline-flex h-8 w-8 -rotate-12 items-center justify-center rounded-xl bg-primary text-primary-fg">
                <Plane className="h-4 w-4" strokeWidth={2.5} />
              </span>
              Traveloop
            </div>

            {hand && (
              <p className="mb-2 font-hand text-3xl font-bold text-primary sm:text-4xl">
                {hand}
              </p>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight text-text sm:text-5xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-3 text-base text-muted sm:text-lg">{tagline}</p>
            )}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
