import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leadingIcon, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      {label && (
        <FieldLabel htmlFor={inputId} required={rest.required}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        {leadingIcon && (
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
              error ? "text-danger" : "text-muted",
            )}
          >
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "block w-full rounded-xl border-2 border-border bg-surface",
            "px-4 py-2.5 text-base text-text placeholder:text-muted/70",
            "transition-colors duration-150",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
            "disabled:bg-bg disabled:cursor-not-allowed",
            leadingIcon && "pl-10",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...rest}
        />
        {error && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-danger">
            <AlertCircle className="h-5 w-5" />
          </span>
        )}
      </div>
      <FieldMessage errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
});
