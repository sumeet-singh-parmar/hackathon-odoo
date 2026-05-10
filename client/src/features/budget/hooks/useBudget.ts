import { useQuery } from "@tanstack/react-query";
import * as budgetApi from "@/features/budget/api/budget";

export function useBudget(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? ["budget", tripId] : ["budget", "none"],
    queryFn: () => budgetApi.getBudget(tripId!),
    enabled: !!tripId,
  });
}
