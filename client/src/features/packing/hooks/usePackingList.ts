import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddPackingItemInput } from "@hackathon/shared";
import * as packingApi from "@/features/packing/api/packing";

const key = (tripId: number) => ["packing", tripId] as const;

export function usePackingList(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? key(tripId) : ["packing", "none"],
    queryFn: () => packingApi.listPacking(tripId!),
    enabled: !!tripId,
  });
}

export function useAddPackingItem(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddPackingItemInput) => packingApi.addPackingItem(tripId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useTogglePackingItem(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => packingApi.togglePackingItem(tripId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useRemovePackingItem(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => packingApi.removePackingItem(tripId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useResetPacking(tripId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => packingApi.resetPacking(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}
