import { useQuery } from "@tanstack/react-query"
import { getProvinces, getStationsByProvince } from "@/api"

export const PROVINCES_KEY = ["provinces"]

export const useProvinces = () => {
  return useQuery({
    queryKey: PROVINCES_KEY,
    queryFn: getProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  })
}

export const useStationsByProvince = (provinceId: string | null) => {
  return useQuery({
    queryKey: ["stations", "province", provinceId],
    queryFn: () =>
      provinceId ? getStationsByProvince(provinceId) : Promise.resolve([]),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 60,
  })
}
