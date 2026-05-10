import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { FieldMessage } from "@/components/forms/FieldMessage";

interface AvatarPickerProps {
  label?: string;
  hint?: string;
  error?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

export function AvatarPicker({ label, hint, error, value, onChange }: AvatarPickerProps) {
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed",
            "transition-colors duration-150",
            error ? "border-danger" : "border-border hover:border-primary",
            preview ? "border-solid" : "bg-bg",
          )}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-6 w-6 text-muted" strokeWidth={2} />
          )}
        </button>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-left font-display text-sm font-semibold text-primary hover:underline"
          >
            {preview ? "Change photo" : "Add a photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-left text-sm text-muted hover:text-danger"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          )}
          {!preview && <span className="text-sm text-muted">jpg, png, webp · up to 2 MB</span>}
        </div>
      </div>
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
