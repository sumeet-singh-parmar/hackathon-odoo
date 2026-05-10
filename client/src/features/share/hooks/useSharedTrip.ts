import { useQuery } from "@tanstack/react-query";
import * as shareApi from "@/features/share/api/share";

export function useSharedTrip(token: string | undefined) {
  return useQuery({
    queryKey: token ? ["shared-trip", token] : ["shared-trip", "none"],
    queryFn: () => shareApi.getSharedTrip(token!),
    enabled: !!token,
  });
}
