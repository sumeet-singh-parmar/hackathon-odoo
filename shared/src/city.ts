import { z } from "zod";

export type CostIndex = 1 | 2 | 3 | 4;

// Unified city shape used across client + server. Some fields are populated only
// on one side (client dummies have imageUrl/blurb/countryCode; server response
// adds description/createdAt) — kept optional so both projections satisfy it.
export interface City {
  id: number;
  name: string;
  country: string;
  costIndex: CostIndex;
  popularity: number;
  region: string | null;
  countryCode?: string;
  imageUrl?: string | null;
  blurb?: string | null;
  description?: string | null;
  createdAt?: string;
}

export const CitySearchQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().optional(),
  sort: z.enum(["popularity", "name", "cost"]).default("popularity"),
  costMax: z.coerce.number().int().min(1).max(4).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
export type CitySearchQuery = z.infer<typeof CitySearchQuerySchema>;

export interface CityListResponse {
  items: City[];
  total: number;
  page: number;
  limit: number;
}

// alias for server code that grew up around the response-typed name
export type CityResponse = City;

export interface ActivityCatalogItem {
  id: number;
  cityId: number;
  name: string;
  type: "SIGHTSEEING" | "FOOD" | "ADVENTURE" | "RELAX" | "CULTURE" | "NIGHTLIFE" | "OTHER";
  averageCost: number;
  averageDurationMinutes: number;
  blurb: string;
  imageUrl: string | null;
}
