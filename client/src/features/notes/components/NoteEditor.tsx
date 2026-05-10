import { useState } from "react";
import { Send } from "lucide-react";
import type { Stop } from "@hackathon/shared";
import { Textarea } from "@/components/forms/Textarea";
import { Select } from "@/components/forms/Select";
import { Button } from "@/components/primitives/Button";

interface NoteEditorProps {
  initialBody?: string;
  initialStopId?: number | null;
  stops?: Stop[];
  onSubmit: (body: string, stopId: number | null) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function NoteEditor({
  initialBody = "",
  initialStopId = null,
  stops,
  onSubmit,
  onCancel,
  submitLabel = "Save note",
}: NoteEditorProps) {
  const [body, setBody] = useState(initialBody);
  const [stopId, setStopId] = useState<number | null>(initialStopId);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await onSubmit(body.trim(), stopId);
      if (!initialBody) {
        setBody("");
        setStopId(null);
      }
    } finally {
      setBusy(false);
    }
  }

  const stopOptions = stops?.length
    ? [
        { value: "", label: "Whole trip (no stop)" },
        ...stops.map((s) => ({
          value: String(s.id),
          label: `${s.cityName}, ${s.countryName}`,
        })),
      ]
    : null;

  return (
    <form onSubmit={submit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Jot something down — restaurant tips, reminders, anything."
        rows={3}
      />
      {stopOptions && (
        <Select
          label="Tie this note to a stop?"
          options={stopOptions}
          value={stopId == null ? "" : String(stopId)}
          onChange={(e) => setStopId(e.target.value ? Number(e.target.value) : null)}
          hint="Optional — leave blank if it's a trip-wide note."
        />
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          loading={busy}
          disabled={!body.trim()}
          trailingIcon={<Send className="h-4 w-4" strokeWidth={2.25} />}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
