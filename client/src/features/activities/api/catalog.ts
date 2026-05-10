import type {
  ActivityListResponse,
  ActivityResponse,
  ActivitySearchQuery,
} from "@hackathon/shared";
import { api } from "@/lib/api";

function buildQuery(q: Partial<ActivitySearchQuery>): string {
  const params = new URLSearchParams();
  if (q.q) params.set("q", q.q);
  if (q.cityId) params.set("cityId", String(q.cityId));
  if (q.type) params.set("type", q.type);
  if (q.maxCost != null) params.set("maxCost", String(q.maxCost));
  if (q.maxDuration != null) params.set("maxDuration", String(q.maxDuration));
  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function searchActivities(
  q: Partial<ActivitySearchQuery> = {},
): Promise<ActivityListResponse> {
  return api<ActivityListResponse>(`/api/cities/activities/search${buildQuery(q)}`);
}

export async function getActivity(id: number): Promise<ActivityResponse> {
  return api<ActivityResponse>(`/api/cities/activities/${id}`);
}
