import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTripInput, UpdateTripInput } from "@hackathon/shared";
import * as tripsApi from "@/features/trips/api/trips";

export const tripsKey = ["trips"] as const;
export const tripKey = (id: number) => ["trip", id] as const;

export function useTrips() {
  return useQuery({ queryKey: tripsKey, queryFn: tripsApi.listTrips });
}

export function useFeaturedTrips() {
  return useQuery({ queryKey: ["trips", "featured"], queryFn: tripsApi.listFeatured });
}

export function useTrip(id: number | undefined) {
  return useQuery({
    queryKey: id ? tripKey(id) : ["trip", "none"],
    queryFn: () => tripsApi.getTrip(id!),
    enabled: !!id,
  });
}

export interface CreateTripPayload {
  input: CreateTripInput;
  cover?: File | null;
}

export interface UpdateTripPayload {
  input: UpdateTripInput;
  cover?: File | null;
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, cover }: CreateTripPayload) => tripsApi.createTrip(input, cover),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsKey });
      qc.invalidateQueries({ queryKey: ["trips", "featured"] });
    },
  });
}

export function useUpdateTrip(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, cover }: UpdateTripPayload) => tripsApi.updateTrip(id, input, cover),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsKey });
      qc.invalidateQueries({ queryKey: tripKey(id) });
      qc.invalidateQueries({ queryKey: ["trips", "featured"] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tripsApi.deleteTrip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsKey });
      qc.invalidateQueries({ queryKey: ["trips", "featured"] });
    },
  });
}

export function useShareTrip(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tripsApi.shareTrip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsKey });
      qc.invalidateQueries({ queryKey: tripKey(id) });
      qc.invalidateQueries({ queryKey: ["trips", "featured"] });
    },
  });
}

export function useUnshareTrip(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tripsApi.unshareTrip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsKey });
      qc.invalidateQueries({ queryKey: tripKey(id) });
      qc.invalidateQueries({ queryKey: ["trips", "featured"] });
    },
  });
}
