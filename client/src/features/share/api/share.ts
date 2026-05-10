import type { Trip, TripDetail } from "@hackathon/shared";
import { api } from "@/lib/api";

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
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function getSharedTrip(token: string): Promise<Trip> {
  const detail = await api<TripDetail>(`/api/public/trips/${token}`, { auth: false });
  return detailToClient(detail);
}

export async function copySharedTrip(token: string): Promise<Trip> {
  const detail = await api<TripDetail>(`/api/public/trips/${token}/copy`, { method: "POST" });
  return detailToClient(detail);
}
