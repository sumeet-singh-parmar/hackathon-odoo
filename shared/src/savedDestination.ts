import { z } from "zod";

export const SaveDestinationSchema = z.object({
  cityId: z.number().int().positive(),
});
export type SaveDestinationInput = z.infer<typeof SaveDestinationSchema>;

export interface SavedDestination {
  id: number;
  cityId: number;
  cityName: string;
  country: string;
  imageUrl: string | null;
  createdAt: string;
}
