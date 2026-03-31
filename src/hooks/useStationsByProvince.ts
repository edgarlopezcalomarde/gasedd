import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getStationsByProvince, type EESSPrecio } from "@/api"

export const useStationsByProvinces = (provinceIds: string[]) => {
  return useQuery({
    queryKey: ["stations", "provinces", provinceIds],
    queryFn: async () => {
      if (provinceIds.length === 0) return []

      const results = await Promise.all(
        provinceIds.map((id) => getStationsByProvince(id))
      )

      const allStations = results.flat()
      const uniqueStations = new Map<string, EESSPrecio>()

      for (const station of allStations) {
        uniqueStations.set(station.IDEESS, station)
      }

      return Array.from(uniqueStations.values())
    },
    enabled: provinceIds.length > 0,
    staleTime: 1000 * 60 * 60,
  })
}

export const usePrefetchStationsByProvince = () => {
  const queryClient = useQueryClient()

  return (provinceId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["stations", "province", provinceId],
      queryFn: () => getStationsByProvince(provinceId),
      staleTime: 1000 * 60 * 60,
    })
  }
}
