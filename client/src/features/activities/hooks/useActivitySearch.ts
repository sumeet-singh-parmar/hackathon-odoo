import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ActivitySearchQuery } from "@hackathon/shared";
import * as catalog from "@/features/activities/api/catalog";

export function useActivitySearch(input: Partial<ActivitySearchQuery> = {}) {
  return useQuery({
    queryKey: ["activities", "search", input],
    queryFn: () => catalog.searchActivities(input),
    placeholderData: keepPreviousData,
  });
}
