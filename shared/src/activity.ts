import { z } from "zod";

export const ActivityTypeValues = [
  "SIGHTSEEING",
  "FOOD",
  "ADVENTURE",
  "NIGHTLIFE",
  "CULTURE",
  "NATURE",
] as const;
export type ActivityType = (typeof ActivityTypeValues)[number];

export const ActivitySearchQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  cityId: z.coerce.number().int().positive().optional(),
  type: z.enum(ActivityTypeValues).optional(),
  maxCost: z.coerce.number().min(0).optional(),
  maxDuration: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ActivitySearchQuery = z.infer<typeof ActivitySearchQuerySchema>;

export interface ActivityResponse {
  id: number;
  cityId: number;
  name: string;
  type: ActivityType;
  baseCost: number;
  durationHours: number;
  description: string | null;
  createdAt: string;
}

export interface ActivityListResponse {
  items: ActivityResponse[];
  total: number;
  page: number;
  limit: number;
}

// legacy alias used by client itinerary hooks before the master/pinned split.
// pinning a master activity to a stop is server-side `PinActivityInput`; clients
// using the legacy `Activity` shape supply a richer in-place create.
export interface CreateActivityInput {
  stopId: number;
  name: string;
  type:
    | "SIGHTSEEING"
    | "FOOD"
    | "ADVENTURE"
    | "RELAX"
    | "CULTURE"
    | "NIGHTLIFE"
    | "OTHER";
  date: string;
  durationMinutes?: number | null;
  cost?: number;
  notes?: string | null;
}

// client-side compat shape for dummy data + UI components (itinerary-pinned activities).
export interface Activity {
  id: number;
  stopId: number;
  name: string;
  type:
    | "SIGHTSEEING"
    | "FOOD"
    | "ADVENTURE"
    | "RELAX"
    | "CULTURE"
    | "NIGHTLIFE"
    | "OTHER";
  date: string;
  durationMinutes: number | null;
  cost: number;
  notes: string | null;
  order: number;
}
