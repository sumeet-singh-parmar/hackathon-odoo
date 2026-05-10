import type { SavedDestination } from "@hackathon/shared";
import { api } from "@/lib/api";

export async function listSavedDestinations(): Promise<SavedDestination[]> {
  return api<SavedDestination[]>("/api/saved-destinations");
}

export async function saveDestination(cityId: number): Promise<SavedDestination> {
  return api<SavedDestination>("/api/saved-destinations", {
    method: "POST",
    body: { cityId },
  });
}

export async function unsaveDestination(cityId: number): Promise<void> {
  await api<void>(`/api/saved-destinations/${cityId}`, { method: "DELETE" });
}
