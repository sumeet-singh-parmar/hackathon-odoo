import type {
  Activity,
  CreateActivityInput,
  CreateStopInput,
  Stop,
  StopResponse,
  TripActivityResponse,
  TripDetail,
} from "@hackathon/shared";
import { api } from "@/lib/api";

// Server returns stops + their activities nested in /api/trips/:id. Cache the
// activity list keyed by stopId so listActivities can serve from it without a
// separate roundtrip.
const activityCache = new Map<number, Activity[]>();

function tripActivityToClient(a: TripActivityResponse, order: number): Activity {
  // Server's master activities use a tighter enum (no RELAX/OTHER). The client
  // legacy shape allows both — coerce unknowns to OTHER.
  const t = a.activity.type;
  const clientType: Activity["type"] =
    t === "SIGHTSEEING" || t === "FOOD" || t === "ADVENTURE" || t === "NIGHTLIFE" || t === "CULTURE"
      ? t
      : "OTHER";
  return {
    id: a.id,
    stopId: a.stopId,
    name: a.activity.name,
    type: clientType,
    date: a.scheduledTime ? a.scheduledTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
    durationMinutes: Math.round((a.activity.durationHours ?? 0) * 60),
    cost: a.customCost ?? a.activity.baseCost,
    notes: a.notes,
    order,
  };
}

function stopToClient(s: StopResponse, order: number): Stop {
  const activities = s.activities.map((a, i) => tripActivityToClient(a, i));
  activityCache.set(s.id, activities);
  return {
    id: s.id,
    tripId: s.tripId,
    cityId: s.cityId,
    cityName: s.city.name,
    countryName: s.city.country,
    arrivalDate: s.startDate,
    departureDate: s.endDate,
    transport: null,
    notes: null,
    order,
  };
}

export async function listStops(tripId: number): Promise<Stop[]> {
  const trip = await api<TripDetail>(`/api/trips/${tripId}`);
  return trip.stops.map(stopToClient);
}

export async function listActivities(stopId: number): Promise<Activity[]> {
  return activityCache.get(stopId) ?? [];
}

export async function addStop(tripId: number, input: CreateStopInput): Promise<Stop> {
  const stop = await api<StopResponse>(`/api/trips/${tripId}/stops`, {
    method: "POST",
    body: input,
  });
  // server response only carries the new stop — order matches server orderIndex.
  return stopToClient(stop, stop.orderIndex);
}

export async function removeStop(_tripId: number, stopId: number): Promise<void> {
  await api<void>(`/api/stops/${stopId}`, { method: "DELETE" });
}

// The real backend uses a master-activity catalog: clients pin a master by
// activityId, not free-form. The legacy `addActivity(name, type, …)` flow is
// not supported on the wire; route the form through the catalog dialog instead.
export async function addActivity(_stopId: number, _input: CreateActivityInput): Promise<Activity> {
  throw new Error("Inline activity create is no longer supported — pin from the city catalog instead.");
}

export async function removeActivity(_stopId: number, activityId: number): Promise<void> {
  await api<void>(`/api/trip-activities/${activityId}`, { method: "DELETE" });
}
