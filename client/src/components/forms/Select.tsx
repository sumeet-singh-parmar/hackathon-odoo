import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, id, className, ...rest },
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
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "block w-full appearance-none rounded-xl border-2 border-border bg-surface",
            "px-4 py-2.5 pr-10 text-base text-text",
            "transition-colors duration-150",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
            "disabled:bg-bg disabled:cursor-not-allowed",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        />
      </div>
      <FieldMessage errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
});
