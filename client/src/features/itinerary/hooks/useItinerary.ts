import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateActivityInput, CreateStopInput } from "@hackathon/shared";
import * as stopsApi from "@/features/itinerary/api/stops";

const stopsKey = (tripId: number) => ["stops", tripId] as const;
const activitiesKey = (stopId: number) => ["activities", stopId] as const;

export function useStops(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? stopsKey(tripId) : ["stops", "none"],
    queryFn: () => stopsApi.listStops(tripId!),
    enabled: !!tripId,
  });
}

export function useActivitiesForStops(stopIds: number[]) {
  return useQueries({
    queries: stopIds.map((id) => ({
      queryKey: activitiesKey(id),
      queryFn: () => stopsApi.listActivities(id),
    })),
  });
}

export function useAddStop(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStopInput) => stopsApi.addStop(tripId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: stopsKey(tripId) }),
  });
}

export function useRemoveStop(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: number) => stopsApi.removeStop(tripId, stopId),
    onSuccess: () => qc.invalidateQueries({ queryKey: stopsKey(tripId) }),
  });
}

export function useAddActivity(stopId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityInput) => stopsApi.addActivity(stopId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: activitiesKey(stopId) }),
  });
}

export function useRemoveActivity(stopId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: number) => stopsApi.removeActivity(stopId, activityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: activitiesKey(stopId) }),
  });
}
