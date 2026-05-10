import { z } from "zod";

export const CreateTripNoteSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  stopId: z.number().int().positive().nullable().optional(),
});
export type CreateTripNoteInput = z.infer<typeof CreateTripNoteSchema>;

export const UpdateTripNoteSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
export type UpdateTripNoteInput = z.infer<typeof UpdateTripNoteSchema>;

export interface TripNoteResponse {
  id: number;
  tripId: number;
  stopId: number | null;
  text: string;
  createdAt: string;
  updatedAt: string;
}

// client-side compat shape for dummy data + UI components.
export interface Note {
  id: number;
  tripId: number;
  stopId: number | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// legacy aliases used by client API/hooks before the rename.
export type CreateNoteInput = CreateTripNoteInput;
export type UpdateNoteInput = UpdateTripNoteInput;
