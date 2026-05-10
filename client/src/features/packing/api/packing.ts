import type {
  AddPackingItemInput,
  PackingCategory,
  PackingItem,
  PackingItemResponse,
} from "@hackathon/shared";
import { api } from "@/lib/api";

// Client UX has six categories (DOCUMENTS / CLOTHING / ELECTRONICS / TOILETRIES
// / HEALTH / MISC). Server enum has four (TOILETRIES / HEALTH / MISC collapse
// to OTHER on the wire). Round-trip is lossy — TOILETRIES/HEALTH/MISC items
// come back as OTHER on next fetch, but the create path keeps the user-typed
// label intact in `name`.
function clientToServerCategory(c: AddPackingItemInput["category"]): PackingCategory {
  if (c === "DOCUMENTS" || c === "CLOTHING" || c === "ELECTRONICS") return c;
  return "OTHER";
}

function serverToClientCategory(c: PackingCategory): PackingItem["category"] {
  return c === "OTHER" ? "MISC" : c;
}

function toClient(p: PackingItemResponse): PackingItem {
  return {
    id: p.id,
    tripId: p.tripId,
    name: p.name,
    category: serverToClientCategory(p.category),
    packed: p.isPacked,
    createdAt: p.createdAt,
  };
}

export async function listPacking(tripId: number): Promise<PackingItem[]> {
  const rows = await api<PackingItemResponse[]>(`/api/trips/${tripId}/packing`);
  return rows.map(toClient);
}

export async function addPackingItem(tripId: number, input: AddPackingItemInput): Promise<PackingItem> {
  const row = await api<PackingItemResponse>(`/api/trips/${tripId}/packing`, {
    method: "POST",
    body: { name: input.name, category: clientToServerCategory(input.category) },
  });
  return toClient(row);
}

export async function togglePackingItem(tripId: number, id: number): Promise<PackingItem> {
  const list = await api<PackingItemResponse[]>(`/api/trips/${tripId}/packing`);
  const current = list.find((i) => i.id === id);
  if (!current) throw new Error("Item not found");
  const row = await api<PackingItemResponse>(`/api/packing-items/${id}`, {
    method: "PATCH",
    body: { isPacked: !current.isPacked },
  });
  return toClient(row);
}

export async function removePackingItem(_tripId: number, id: number): Promise<void> {
  await api<void>(`/api/packing-items/${id}`, { method: "DELETE" });
}

export async function resetPacking(tripId: number): Promise<PackingItem[]> {
  const rows = await api<PackingItemResponse[]>(`/api/trips/${tripId}/packing/reset`, {
    method: "POST",
  });
  return rows.map(toClient);
}
