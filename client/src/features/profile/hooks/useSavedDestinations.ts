import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as savedApi from "@/features/profile/api/saved-destinations";

const KEY = ["saved-destinations"] as const;

export function useSavedDestinations() {
  return useQuery({ queryKey: KEY, queryFn: savedApi.listSavedDestinations });
}

export function useSaveDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cityId: number) => savedApi.saveDestination(cityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUnsaveDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cityId: number) => savedApi.unsaveDestination(cityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
