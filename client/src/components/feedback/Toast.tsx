import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "danger" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-auto">
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const variantClasses: Record<ToastVariant, { wrap: string; icon: ReactNode }> = {
  success: {
    wrap: "border-success/40 bg-surface text-text",
    icon: <CheckCircle2 className="h-5 w-5 text-success" strokeWidth={2.25} />,
  },
  danger: {
    wrap: "border-danger/40 bg-surface text-text",
    icon: <AlertCircle className="h-5 w-5 text-danger" strokeWidth={2.25} />,
  },
  info: {
    wrap: "border-accent/40 bg-surface text-text",
    icon: <Info className="h-5 w-5 text-accent" strokeWidth={2.25} />,
  },
};

function ToastView({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const v = variantClasses[toast.variant];

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border-2 px-4 py-3 shadow-card",
        "animate-[slide-up_180ms_ease-out]",
        v.wrap,
      )}
    >
      <span className="mt-0.5">{v.icon}</span>
      <div className="flex-1 text-sm">
        <p className="font-display font-semibold">{toast.title}</p>
        {toast.message && <p className="text-muted">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 text-muted hover:bg-bg"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
