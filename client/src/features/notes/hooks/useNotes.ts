import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTripNoteInput, UpdateTripNoteInput } from "@hackathon/shared";
import * as notesApi from "@/features/notes/api/notes";

const key = (tripId: number) => ["notes", tripId] as const;

export function useNotes(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? key(tripId) : ["notes", "none"],
    queryFn: () => notesApi.listNotes(tripId!),
    enabled: !!tripId,
  });
}

export function useAddNote(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripNoteInput) => notesApi.addNote(tripId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useUpdateNote(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTripNoteInput }) =>
      notesApi.updateNote(tripId, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useRemoveNote(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesApi.removeNote(tripId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}
