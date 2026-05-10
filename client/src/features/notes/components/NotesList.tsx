import { StickyNote } from "lucide-react";
import type { Trip } from "@hackathon/shared";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageSpinner } from "@/components/primitives/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { Badge } from "@/components/primitives/Badge";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NoteCard } from "@/features/notes/components/NoteCard";
import {
  useAddNote,
  useNotes,
  useRemoveNote,
  useUpdateNote,
} from "@/features/notes/hooks/useNotes";
import { useStops } from "@/features/itinerary/hooks/useItinerary";

export function NotesList({ trip }: { trip: Trip }) {
  const notes = useNotes(trip.id);
  const stops = useStops(trip.id);
  const add = useAddNote(trip.id);
  const update = useUpdateNote(trip.id);
  const remove = useRemoveNote(trip.id);

  if (notes.isLoading) return <PageSpinner label="Loading notes…" />;
  if (notes.isError)
    return <ErrorBanner title="Couldn't load notes" message={(notes.error as Error).message} />;

  const items = notes.data ?? [];
  const stopList = stops.data ?? [];
  const stopById = new Map(stopList.map((s) => [s.id, s]));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <p className="font-display text-lg font-bold text-text">Quick note</p>
        <p className="mb-3 text-sm text-muted">A thought, a tip, anything you'll forget otherwise.</p>
        <NoteEditor
          submitLabel="Add note"
          stops={stopList}
          onSubmit={async (body, stopId) => {
            await add.mutateAsync({ text: body, stopId });
          }}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          illustration={<StickyNote className="h-10 w-10" strokeWidth={1.5} />}
          title="No notes yet"
          description="The first thing you jot down — sometimes that's the most useful one."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((note) => {
            const stop = note.stopId != null ? stopById.get(note.stopId) : null;
            return (
              <li key={note.id} className="space-y-1">
                {stop && (
                  <Badge tone="primary">📍 {stop.cityName}</Badge>
                )}
                <NoteCard
                  note={note}
                  onUpdate={async (id, body) => {
                    await update.mutateAsync({ id, input: { text: body } });
                  }}
                  onRemove={async (id) => {
                    await remove.mutateAsync(id);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
