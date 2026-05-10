import type {
  ActivityListResponse,
  ActivityResponse,
  City,
  CityListResponse,
  CitySearchQuery,
} from "@hackathon/shared";
import { api } from "@/lib/api";

function buildQuery(input: Partial<CitySearchQuery>): string {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.country) params.set("country", input.country);
  if (input.region) params.set("region", input.region);
  if (input.sort) params.set("sort", input.sort);
  if (input.costMax !== undefined) params.set("costMax", String(input.costMax));
  if (input.page !== undefined) params.set("page", String(input.page));
  if (input.limit !== undefined) params.set("limit", String(input.limit));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function searchCities(input: Partial<CitySearchQuery> = {}): Promise<CityListResponse> {
  return api<CityListResponse>(`/api/cities${buildQuery(input)}`);
}

// kept for autocomplete-style consumers (AddStopDialog) — not paginated
export async function listCities(query?: string): Promise<City[]> {
  const res = await searchCities({ q: query, limit: 100 });
  return res.items;
}

export async function getCity(id: number): Promise<City> {
  return api<City>(`/api/cities/${id}`);
}

export async function listActivityCatalog(cityId: number): Promise<ActivityResponse[]> {
  const res = await api<ActivityListResponse>(`/api/cities/activities/search?cityId=${cityId}&limit=100`);
  return res.items;
}
