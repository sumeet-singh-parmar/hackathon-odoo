import type {
  CreateTripNoteInput,
  Note,
  TripNoteResponse,
  UpdateTripNoteInput,
} from "@hackathon/shared";
import { api } from "@/lib/api";

function toClient(n: TripNoteResponse): Note {
  return {
    id: n.id,
    tripId: n.tripId,
    stopId: n.stopId,
    body: n.text,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export async function listNotes(tripId: number): Promise<Note[]> {
  const rows = await api<TripNoteResponse[]>(`/api/trips/${tripId}/notes`);
  return rows.map(toClient);
}

export async function addNote(tripId: number, input: CreateTripNoteInput): Promise<Note> {
  const row = await api<TripNoteResponse>(`/api/trips/${tripId}/notes`, {
    method: "POST",
    body: input,
  });
  return toClient(row);
}

export async function updateNote(
  _tripId: number,
  id: number,
  input: UpdateTripNoteInput,
): Promise<Note> {
  const row = await api<TripNoteResponse>(`/api/notes/${id}`, { method: "PATCH", body: input });
  return toClient(row);
}

export async function removeNote(_tripId: number, id: number): Promise<void> {
  await api<void>(`/api/notes/${id}`, { method: "DELETE" });
}
