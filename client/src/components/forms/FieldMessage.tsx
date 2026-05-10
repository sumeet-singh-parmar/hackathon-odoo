import { AlertCircle } from "lucide-react";

interface FieldMessageProps {
  errorId: string;
  hintId: string;
  error?: string;
  hint?: string;
}

export function FieldMessage({ errorId, hintId, error, hint }: FieldMessageProps) {
  if (error) {
    return (
      <p
        id={errorId}
        role="alert"
        className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-danger"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>{error}</span>
      </p>
    );
  }
  if (hint) {
    return (
      <p id={hintId} className="mt-1.5 text-sm text-muted">
        {hint}
      </p>
    );
  }
  return null;
}
