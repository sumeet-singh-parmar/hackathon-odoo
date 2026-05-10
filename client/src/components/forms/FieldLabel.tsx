import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FieldLabel({ required, className, children, ...rest }: FieldLabelProps) {
  return (
    <label
      className={cn("mb-1.5 block font-display text-sm font-semibold text-text", className)}
      {...rest}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-primary">
          *
        </span>
      )}
    </label>
  );
}
