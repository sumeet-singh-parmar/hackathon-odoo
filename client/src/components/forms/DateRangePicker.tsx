import { useId } from "react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface DateRangePickerProps {
  label?: string;
  startLabel?: string;
  endLabel?: string;
  hint?: string;
  startError?: string;
  endError?: string;
  required?: boolean;
  startProps: React.InputHTMLAttributes<HTMLInputElement>;
  endProps: React.InputHTMLAttributes<HTMLInputElement>;
}

export function DateRangePicker({
  label,
  startLabel = "From",
  endLabel = "To",
  hint,
  startError,
  endError,
  required,
  startProps,
  endProps,
}: DateRangePickerProps) {
  const id = useId();
  const error = startError ?? endError;

  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <DateField
          label={startLabel}
          inputId={`${id}-start`}
          error={startError}
          {...startProps}
        />
        <DateField
          label={endLabel}
          inputId={`${id}-end`}
          error={endError}
          {...endProps}
        />
      </div>
      <FieldMessage errorId={`${id}-error`} hintId={`${id}-hint`} error={error} hint={hint} />
    </div>
  );
}

function DateField({
  label,
  inputId,
  error,
  ...rest
}: { label: string; inputId: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="min-w-0 sm:flex-1 sm:basis-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        id={inputId}
        type="date"
        aria-invalid={error ? true : undefined}
        className={cn(
          "block w-full min-w-0 rounded-xl border-2 border-border bg-surface",
          "px-3 py-2.5 text-base text-text",
          "transition-colors duration-150",
          "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
        )}
        {...rest}
      />
    </div>
  );
}
