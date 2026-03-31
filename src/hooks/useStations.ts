import { useQuery } from "@tanstack/react-query"
import { getStations, getStationsByProduct } from "@/api"

export const STATIONS_KEY = ["stations"]

export const useStations = (productId?: string) => {
  return useQuery({
    queryKey: productId ? [...STATIONS_KEY, productId] : STATIONS_KEY,
    queryFn: () =>
      productId ? getStationsByProduct(productId) : getStations(),
  })
}
