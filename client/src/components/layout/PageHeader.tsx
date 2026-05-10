import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  hand?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ hand, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {hand && <p className="font-hand text-2xl text-primary sm:text-3xl">{hand}</p>}
        <h1 className="font-display text-3xl font-bold leading-tight text-text sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-base text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
