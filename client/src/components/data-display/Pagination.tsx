import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visible = pageWindow(page, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <PageButton onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
      {visible.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-2 text-sm text-muted">
            …
          </span>
        ) : (
          <PageButton key={p} active={p === page} onClick={() => onChange(p)}>
            {p}
          </PageButton>
        ),
      )}
      <PageButton onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  active,
  className,
  ...rest
}: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border-2 px-3 font-display text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-surface text-text hover:border-primary hover:text-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}

function pageWindow(page: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const push = (n: number | "...") => pages.push(n);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) push(i);
    return pages;
  }
  push(1);
  if (page > 3) push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) push(i);
  if (page < total - 2) push("...");
  push(total);
  return pages;
}
