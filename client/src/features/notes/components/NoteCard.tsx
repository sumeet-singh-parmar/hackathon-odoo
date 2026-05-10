import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Note } from "@hackathon/shared";
import { Card } from "@/components/primitives/Card";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { formatRelative } from "@/lib/format";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: number, body: string) => Promise<void> | void;
  onRemove: (id: number) => Promise<void> | void;
}

export function NoteCard({ note, onUpdate, onRemove }: NoteCardProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-4">
      {editing ? (
        <NoteEditor
          initialBody={note.body}
          submitLabel="Update note"
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            await onUpdate(note.id, body);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <p className="whitespace-pre-line font-sans text-text">{note.body}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">{formatRelative(note.updatedAt)}</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-display font-semibold text-muted hover:bg-bg hover:text-text"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRemove(note.id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-display font-semibold text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
