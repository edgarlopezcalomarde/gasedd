import { useQuery } from "@tanstack/react-query"
import { getStationsByProvince, type EESSPrecio } from "@/api"
import { useStationDataStore, useCacheSettingsStore } from "@/stores"
import { db, type CacheEntry } from "@/lib/db"
import { useEffect, useState } from "react"

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const loadCachedProvinces = async (): Promise<string[]> => {
  const allEntries = await db.cache.toArray()
  const validProvinces: string[] = []

  for (const entry of allEntries) {
    if (isToday(entry.timestamp) || Date.now() < entry.expiresAt) {
      const provinceId = entry.id.replace("stations_", "")
      validProvinces.push(provinceId)
    }
  }

  return validProvinces
}

export const useStationsByProvinces = (provinceIds: string[]) => {
  const {
    stations: existingStations,
    addStations,
    setLoading,
    setLastUpdated,
    loadedProvinces,
    addLoadedProvinces,
  } = useStationDataStore()
  const { cacheEnabled, cacheDurationHours, updateLastCacheUpdate } =
    useCacheSettingsStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeFromCache = async () => {
      if (loadedProvinces.length === 0 && !isInitialized) {
        const cachedProvinceIds = await loadCachedProvinces()

        if (cachedProvinceIds.length > 0) {
          const allCachedStations: EESSPrecio[] = []

          for (const provinceId of cachedProvinceIds) {
            const entry = await db.cache.get(`stations_${provinceId}`)
            if (entry?.data) {
              allCachedStations.push(...(entry.data as EESSPrecio[]))
            }
          }

          if (allCachedStations.length > 0) {
            const uniqueStations = new Map<string, EESSPrecio>()
            for (const station of allCachedStations) {
              uniqueStations.set(station.IDEESS, station)
            }
            const stations = Array.from(uniqueStations.values())
            addLoadedProvinces(cachedProvinceIds)
            addStations(stations)
            setLastUpdated()
          }
        }

        setIsInitialized(true)
      } else if (loadedProvinces.length > 0) {
        setIsInitialized(true)
      }
    }

    initializeFromCache()
  }, [])

  const newProvinceIds = provinceIds.filter(
    (id) => !loadedProvinces.includes(id)
  )

  useQuery({
    queryKey: ["stations", "provinces", newProvinceIds],
    queryFn: async () => {
      if (newProvinceIds.length === 0) return []

      setLoading(true)

      if (cacheEnabled) {
        const cachedEntries: CacheEntry[] = []
        const uncachedProvinces: string[] = []

        for (const provinceId of newProvinceIds) {
          const cacheKey = `stations_${provinceId}`
          const cached = await db.cache.get(cacheKey)

          if (
            cached &&
            (isToday(cached.timestamp) || Date.now() < cached.expiresAt)
          ) {
            cachedEntries.push(cached)
          } else {
            uncachedProvinces.push(provinceId)
          }
        }

        if (cachedEntries.length > 0) {
          const cachedData = cachedEntries.flatMap(
            (e) => e.data as EESSPrecio[]
          )

          if (uncachedProvinces.length === 0) {
            const uniqueStations = new Map<string, EESSPrecio>()
            for (const station of cachedData) {
              uniqueStations.set(station.IDEESS, station)
            }
            const stations = Array.from(uniqueStations.values())
            addLoadedProvinces(
              cachedEntries.map((e) => e.id.replace("stations_", ""))
            )
            addStations(stations)
            setLoading(false)
            setLastUpdated()
            return stations
          }

          const results = await Promise.all(
            uncachedProvinces.map((id) => getStationsByProvince(id))
          )

          const fetchedStations = results.flat()
          const allStations = [...cachedData, ...fetchedStations]
          const uniqueStations = new Map<string, EESSPrecio>()

          for (const station of allStations) {
            uniqueStations.set(station.IDEESS, station)
          }

          const finalStations = Array.from(uniqueStations.values())

          const expiresAt = Date.now() + cacheDurationHours * 60 * 60 * 1000
          for (const provinceId of uncachedProvinces) {
            const provinceStations = finalStations.filter(
              (s) => s.IDProvincia === provinceId
            )
            const cacheKey = `stations_${provinceId}`
            await db.cache.put({
              id: cacheKey,
              queryKey: JSON.stringify(["stations", "province", provinceId]),
              data: provinceStations,
              timestamp: Date.now(),
              expiresAt,
            })
          }

          addLoadedProvinces(newProvinceIds)
          addStations(finalStations)
          setLoading(false)
          setLastUpdated()
          updateLastCacheUpdate()
          return finalStations
        }
      }

      const results = await Promise.all(
        newProvinceIds.map((id) => getStationsByProvince(id))
      )

      const allStations = results.flat()
      const uniqueStations = new Map<string, EESSPrecio>()

      for (const station of allStations) {
        uniqueStations.set(station.IDEESS, station)
      }

      const stations = Array.from(uniqueStations.values())

      if (cacheEnabled) {
        const expiresAt = Date.now() + cacheDurationHours * 60 * 60 * 1000

        for (const provinceId of newProvinceIds) {
          const provinceStations = stations.filter(
            (s) => s.IDProvincia === provinceId
          )
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

      addLoadedProvinces(newProvinceIds)
      addStations(stations)
      setLoading(false)
      setLastUpdated()

      return stations
    },
    enabled: isInitialized && newProvinceIds.length > 0,
    staleTime: cacheEnabled ? cacheDurationHours * 60 * 60 * 1000 : 0,
  })

  return {
    isLoading: false,
    isInitialLoad: !isInitialized,
    data: existingStations,
  }
}

export const usePrefetchStationsByProvince = () => {
  return (provinceId: string) => {
    return getStationsByProvince(provinceId)
  }
}
