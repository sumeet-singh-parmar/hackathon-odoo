import type {
  CreateTripInput,
  ListTripsResponse,
  Trip,
  TripDetail,
  TripSummary,
  UpdateTripInput,
} from "@hackathon/shared";
import { api } from "@/lib/api";

function summaryToClient(s: TripSummary & { ownerId?: number }): Trip {
  return {
    id: s.id,
    ownerId: s.ownerId ?? 0,
    name: s.name,
    description: s.description,
    startDate: s.startDate,
    endDate: s.endDate,
    coverUrl: s.coverPhotoUrl,
    budget: s.totalBudget > 0 ? s.totalBudget : null,
    currency: s.currency,
    visibility: s.isPublic ? "PUBLIC" : "PRIVATE",
    status: s.status,
    shareToken: s.shareSlug,
    stopCount: s.stopCount,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

function detailToClient(d: TripDetail): Trip {
  return {
    id: d.id,
    ownerId: d.ownerId,
    name: d.name,
    description: d.description,
    startDate: d.startDate,
    endDate: d.endDate,
    coverUrl: d.coverPhotoUrl,
    budget: d.totalBudget > 0 ? d.totalBudget : null,
    currency: d.currency,
    visibility: d.isPublic ? "PUBLIC" : "PRIVATE",
    status: d.status,
    shareToken: d.shareSlug,
    stopCount: d.stops.length,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function listTrips(): Promise<Trip[]> {
  const res = await api<ListTripsResponse>("/api/trips?limit=100");
  return res.items.map(summaryToClient);
}

export async function listFeatured(): Promise<Trip[]> {
  return api<Trip[]>("/api/trips/featured", { auth: false });
}

export async function getTrip(id: number): Promise<Trip> {
  const detail = await api<TripDetail>(`/api/trips/${id}`);
  return detailToClient(detail);
}

function buildTripFormData(
  input: Partial<CreateTripInput & UpdateTripInput>,
  cover: File,
): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || v === "") continue;
    fd.append(k, String(v));
  }
  fd.append("cover", cover);
  return fd;
}

export async function createTrip(input: CreateTripInput, cover?: File | null): Promise<Trip> {
  const summary = cover
    ? await api<TripSummary>("/api/trips", {
        method: "POST",
        body: buildTripFormData(input, cover),
      })
    : await api<TripSummary>("/api/trips", { method: "POST", body: input });
  return summaryToClient(summary);
}

export async function updateTrip(
  id: number,
  input: UpdateTripInput,
  cover?: File | null,
): Promise<Trip> {
  const summary = cover
    ? await api<TripSummary>(`/api/trips/${id}`, {
        method: "PATCH",
        body: buildTripFormData(input, cover),
      })
    : await api<TripSummary>(`/api/trips/${id}`, { method: "PATCH", body: input });
  return summaryToClient(summary);
}

export async function deleteTrip(id: number): Promise<void> {
  await api<void>(`/api/trips/${id}`, { method: "DELETE" });
}

export async function shareTrip(id: number): Promise<Trip> {
  const summary = await api<TripSummary>(`/api/trips/${id}/share`, { method: "POST" });
  return summaryToClient(summary);
}

export async function unshareTrip(id: number): Promise<Trip> {
  const summary = await api<TripSummary>(`/api/trips/${id}/share`, { method: "DELETE" });
  return summaryToClient(summary);
}
