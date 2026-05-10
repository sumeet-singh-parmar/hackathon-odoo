import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CitySearchQuery } from "@hackathon/shared";
import * as citiesApi from "@/features/cities/api/cities";

export function useCitySearch(input: Partial<CitySearchQuery> = {}) {
  return useQuery({
    queryKey: ["cities", "search", input],
    queryFn: () => citiesApi.searchCities(input),
    placeholderData: keepPreviousData,
  });
}

export function useCities(query?: string) {
  return useQuery({
    queryKey: ["cities", query ?? ""],
    queryFn: () => citiesApi.listCities(query),
  });
}

export function useCity(id: number | undefined) {
  return useQuery({
    queryKey: id ? ["city", id] : ["city", "none"],
    queryFn: () => citiesApi.getCity(id!),
    enabled: !!id,
  });
}

export function useActivityCatalog(cityId: number | undefined) {
  return useQuery({
    queryKey: cityId ? ["activity-catalog", cityId] : ["activity-catalog", "none"],
    queryFn: () => citiesApi.listActivityCatalog(cityId!),
    enabled: !!cityId,
  });
}
