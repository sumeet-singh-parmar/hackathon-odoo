import { AlertTriangle } from "lucide-react";

interface ErrorBannerProps {
  title: string;
  message: string;
}

export function ErrorBanner({ title, message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border-2 border-danger/30 bg-danger/5 px-4 py-3"
    >
      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
        <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <div className="text-sm">
        <p className="font-display font-semibold text-danger">{title}</p>
        <p className="text-text/80">{message}</p>
      </div>
    </div>
  );
}
