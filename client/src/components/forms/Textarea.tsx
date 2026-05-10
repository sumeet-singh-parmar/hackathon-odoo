import { TextareaHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, leadingIcon, id, className, rows = 4, ...rest },
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
              "pointer-events-none absolute left-3 top-3",
              error ? "text-danger" : "text-muted",
            )}
          >
            {leadingIcon}
          </span>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "block w-full rounded-xl border-2 border-border bg-surface",
            "px-4 py-3 text-base text-text placeholder:text-muted/70",
            "transition-colors duration-150 resize-y",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
            "disabled:bg-bg disabled:cursor-not-allowed",
            leadingIcon && "pl-10",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...rest}
        />
      </div>
      <FieldMessage errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
});
