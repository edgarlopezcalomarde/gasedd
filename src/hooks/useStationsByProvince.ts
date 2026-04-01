import { useQuery } from "@tanstack/react-query"
import { getStationsByProvince, type EESSPrecio } from "@/api"
import { useStationDataStore, useCacheSettingsStore } from "@/stores"
import { db, type CacheEntry } from "@/lib/db"

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const useStationsByProvinces = (provinceIds: string[]) => {
  const { setStations, setLoading, setLastUpdated } = useStationDataStore()
  const { cacheEnabled, cacheDurationHours, updateLastCacheUpdate } =
    useCacheSettingsStore()

  return useQuery({
    queryKey: ["stations", "provinces", provinceIds],
    queryFn: async () => {
      if (provinceIds.length === 0) return []

      setLoading(true)

      let allStations: EESSPrecio[] = []

      if (cacheEnabled) {
        const cachedEntries: CacheEntry[] = []

        for (const provinceId of provinceIds) {
          const cacheKey = `stations_${provinceId}`
          const cached = await db.cache.get(cacheKey)

          if (cached) {
            if (isToday(cached.timestamp) || Date.now() < cached.expiresAt) {
              cachedEntries.push(cached)
            }
          }
        }

        if (cachedEntries.length === provinceIds.length) {
          const mergedData = cachedEntries.flatMap(
            (e) => e.data as EESSPrecio[]
          )
          const uniqueStations = new Map<string, EESSPrecio>()

          for (const station of mergedData) {
            uniqueStations.set(station.IDEESS, station)
          }

          const stations = Array.from(uniqueStations.values())
          setStations(stations)
          setLoading(false)
          setLastUpdated()
          return stations
        }
      }

      const results = await Promise.all(
        provinceIds.map((id) => getStationsByProvince(id))
      )

      allStations = results.flat()
      const uniqueStations = new Map<string, EESSPrecio>()

      for (const station of allStations) {
        uniqueStations.set(station.IDEESS, station)
      }

      const stations = Array.from(uniqueStations.values())
      setStations(stations)
      setLoading(false)
      setLastUpdated()

      if (cacheEnabled) {
        const expiresAt = Date.now() + cacheDurationHours * 60 * 60 * 1000

        for (const provinceId of provinceIds) {
          const provinceStations = stations
          const cacheKey = `stations_${provinceId}`

          await db.cache.put({
            id: cacheKey,
            queryKey: JSON.stringify(["stations", "province", provinceId]),
            data: provinceStations,
            timestamp: Date.now(),
            expiresAt,
          })
        }

        updateLastCacheUpdate()
      }

      return stations
    },
    enabled: provinceIds.length > 0,
    staleTime: cacheEnabled ? cacheDurationHours * 60 * 60 * 1000 : 0,
  })
}

export const usePrefetchStationsByProvince = () => {
  return (provinceId: string) => {
    return getStationsByProvince(provinceId)
  }
}
