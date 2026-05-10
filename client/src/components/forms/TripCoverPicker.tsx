import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface TripCoverPickerProps {
  label?: string;
  hint?: string;
  error?: string;
  value: File | null;
  /** Existing cover URL when editing — shown when no new file is picked. */
  initialUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function TripCoverPicker({
  label,
  hint,
  error,
  value,
  initialUrl,
  onChange,
}: TripCoverPickerProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const showImage = preview ?? initialUrl ?? null;

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  function handleClear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
          error ? "border-danger" : "border-border hover:border-primary",
          showImage ? "border-solid" : "bg-bg",
        )}
        style={{ aspectRatio: "16 / 9" }}
      >
        {showImage ? (
          <>
            <img
              src={showImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-ink/55 py-2 font-display text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-4 w-4" strokeWidth={2.25} />
              Change cover
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Camera className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="font-display text-sm font-semibold text-text">
              Add a cover photo
            </span>
            <span className="text-xs text-muted">jpg, png, webp · up to 2 MB</span>
          </div>
        )}
      </button>

      {showImage && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted hover:text-danger"
        >
          <X className="h-4 w-4" />
          Remove cover
        </button>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        className="sr-only"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
      />
      <FieldMessage errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
}
