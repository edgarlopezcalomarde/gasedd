import { useState, useEffect, useMemo, useRef } from "react"
import {
  Map,
  MapControls,
  useMap,
  MapMarker,
  MarkerContent,
} from "@/components/ui/map"
import {
  useSettingsStore,
  useMapStore,
  useStationStore,
  useStationDataStore,
} from "@/stores"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useFilterStore } from "@/stores/filterStore"
import {
  findCheapestStation,
  findExpensiveStation,
  calculatePriceStats,
  getFuelPrice,
} from "@/lib/price-utils"
import { getFuelTypeById, DEFAULT_FUEL_KEY } from "@/lib/fuel-types"
import {
  MAP_STYLES,
  PRICE_COLORS,
  PROVINCE_BOUNDS,
  findProvinceByCoords,
} from "@/lib/constants"
import type { EESSPrecio } from "@/api/types"
import { Loader2, MapPin, Star, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { RouteLayer } from "./RouteLayer"

function getProvincesInBounds(
  bounds: [[number, number], [number, number]]
): string[] {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds
  const provinces: string[] = []

  for (const [id, provinceBounds] of Object.entries(PROVINCE_BOUNDS)) {
    if (
      provinceBounds.lngMin <= maxLng &&
      provinceBounds.lngMax >= minLng &&
      provinceBounds.latMin <= maxLat &&
      provinceBounds.latMax >= minLat
    ) {
      provinces.push(id)
    }
  }

  return provinces
}

function MapUpdater() {
  const { map, isLoaded } = useMap()
  const { setViewport, setBounds, isBlocked, selectedStationId } = useMapStore()
  const { setCheapestStation, setExpensiveStation } = useStationStore()
  const { stations } = useStationDataStore()
  const { selectedFuel } = useFilterStore()

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY

  const handleMoveEnd = () => {
    if (!map) return

    const center = map.getCenter()
    const bounds = map.getBounds()

    setViewport({
      lng: center.lng,
      lat: center.lat,
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    })

    if (bounds) {
      setBounds([
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ])
    }
  }

  useEffect(() => {
    if (!map || !isLoaded) return

    map.on("moveend", handleMoveEnd)

    return () => {
      map.off("moveend", handleMoveEnd)
    }
  }, [map, isLoaded])

  useEffect(() => {
    if (!map || !isLoaded || stations.length === 0) return

    const cheapest = findCheapestStation(stations, fuelKey)
    const expensive = findExpensiveStation(stations, fuelKey)

    setCheapestStation(cheapest?.IDEESS ?? null)
    setExpensiveStation(expensive?.IDEESS ?? null)
  }, [
    stations,
    fuelKey,
    isLoaded,
    map,
    isBlocked,
    setCheapestStation,
    setExpensiveStation,
  ])

  useEffect(() => {
    if (!map || !isLoaded || !selectedStationId) return

    const station = stations.find((s) => s.IDEESS === selectedStationId)
    if (station && !isBlocked) {
      map.flyTo({
        center: [
          parseFloat(station["Longitud (WGS84)"].replace(",", ".")),
          parseFloat(station.Latitud.replace(",", ".")),
        ],
        zoom: 15,
        duration: 800,
      })
    }
  }, [selectedStationId, isLoaded, map, stations, isBlocked])

  return null
}

interface LocationPermissionProps {
  onGranted: (coords: { latitude: number; longitude: number }) => void
  onDenied: () => void
  loading: boolean
}

function LocationPermission({
  onGranted,
  onDenied,
  loading,
}: LocationPermissionProps) {
  const { requestLocation } = useGeolocation()

  const handleAllow = async () => {
    try {
      const coords = await requestLocation()
      onGranted(coords)
    } catch {
      onDenied()
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-2xl border border-white/10 bg-black/90 p-6 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-white/10 p-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Permitir ubicación
        </h2>
        <p className="mb-6 text-sm text-white/60">
          Necesitamos tu ubicación para mostrar las gasolineras más cercanas y
          detectar automáticamente tu provincia.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onDenied}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Denegar
          </button>
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "Solicitando..." : "Permitir"}
          </button>
        </div>
      </div>
    </div>
  )
}

function StationMarkersLayer({
  onStationClick,
}: {
  onStationClick?: (station: EESSPrecio) => void
}) {
  const { isLoaded, getBounds } = useMap()
  const { bounds, setViewStats, viewport, setVisibleProvinces } = useMapStore()
  const { selectedFuel } = useFilterStore()
  const { stations, isLoading } = useStationDataStore()
  const {
    cheapestStationId,
    expensiveStationId,
    setCheapestStation,
    setExpensiveStation,
  } = useStationStore()

  const [debouncedBounds, setDebouncedBounds] = useState<
    [[number, number], [number, number]] | null
  >(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY
  const zoom = viewport?.zoom ?? 6
  const showMarkers = zoom >= 6

  const visibleProvinceIds = useMemo(() => {
    if (!bounds) return []
    return getProvincesInBounds(bounds)
  }, [bounds])

  useEffect(() => {
    if (!bounds && isLoaded && getBounds && !initialLoadDone) {
      const mapBounds = getBounds()
      if (mapBounds) {
        const initialBounds: [[number, number], [number, number]] = [
          [mapBounds.getWest(), mapBounds.getSouth()],
          [mapBounds.getEast(), mapBounds.getNorth()],
        ]
        setDebouncedBounds(initialBounds)
        const provinces = getProvincesInBounds(initialBounds)
        setVisibleProvinces(provinces)
        setInitialLoadDone(true)
      }
    }
  }, [isLoaded, getBounds, initialLoadDone, setVisibleProvinces, bounds])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      if (bounds) {
        setDebouncedBounds(bounds)
        const provinces = getProvincesInBounds(bounds)
        setVisibleProvinces(provinces)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [bounds, setVisibleProvinces])

  useStationsByProvinces(visibleProvinceIds)

  const stationsInView = useMemo(() => {
    if (stations.length === 0) return []

    const boundsToUse = debouncedBounds || bounds
    if (!boundsToUse) return []

    const [[minLng, minLat], [maxLng, maxLat]] = boundsToUse

    return stations.filter((station) => {
      const lng = parseFloat(
        station["Longitud (WGS84)"]?.replace(",", ".") || "0"
      )
      const lat = parseFloat(station.Latitud?.replace(",", ".") || "0")
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    })
  }, [stations, debouncedBounds, bounds])

  const stats = useMemo(() => {
    if (!stationsInView || stationsInView.length === 0) return null
    const calculatedStats = calculatePriceStats(stationsInView, fuelKey)
    setViewStats(calculatedStats)
    return calculatedStats
  }, [stationsInView, fuelKey, setViewStats])

  useEffect(() => {
    if (!stationsInView || stationsInView.length === 0) return

    const cheapest = findCheapestStation(stationsInView, fuelKey)
    const expensive = findExpensiveStation(stationsInView, fuelKey)

    setCheapestStation(cheapest?.IDEESS ?? null)
    setExpensiveStation(expensive?.IDEESS ?? null)
  }, [stationsInView, fuelKey, setCheapestStation, setExpensiveStation])

  const hasSelectedFuel = !!selectedFuel

  if (!isLoaded || !showMarkers) return null

  const displayStations = stationsInView.slice(0, 200)

  return (
    <>
      {isLoading && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-white">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              Cargando {visibleProvinceIds.length} provincia
              {visibleProvinceIds.length > 1 ? "s" : ""}...
            </span>
          </div>
        </div>
      )}

      {displayStations.map((station) => {
        const lng = parseFloat(
          station["Longitud (WGS84)"]?.replace(",", ".") || "0"
        )
        const lat = parseFloat(station.Latitud?.replace(",", ".") || "0")

        if (isNaN(lng) || isNaN(lat)) return null

        const price = getFuelPrice(
          station as unknown as Record<string, string | undefined>,
          fuelKey
        )
        const isCheapest = station.IDEESS === cheapestStationId
        const isExpensive = station.IDEESS === expensiveStationId

        let color: string = PRICE_COLORS.medium
        if (price !== null && stats) {
          if (price <= stats.p33) color = PRICE_COLORS.low as string
          else if (price >= stats.p66) color = PRICE_COLORS.high as string
        }

        const markerSize = isCheapest || isExpensive ? "h-7 w-7" : "h-5 w-5"
        const iconSize = isCheapest
          ? "h-4 w-4"
          : isExpensive
            ? "h-4 w-4"
            : "h-0 w-0"

        const displayPrice = hasSelectedFuel ? price : (stats?.mean ?? null)

        return (
          <MapMarker
            key={station.IDEESS}
            longitude={lng}
            latitude={lat}
            onClick={() => onStationClick?.(station)}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white shadow-lg",
                    markerSize
                  )}
                  style={{ backgroundColor: color }}
                >
                  {isCheapest && (
                    <Star className={cn("fill-white text-white", iconSize)} />
                  )}
                  {isExpensive && !isCheapest && (
                    <AlertTriangle
                      className={cn("fill-white text-white", iconSize)}
                    />
                  )}
                </div>
                {hasSelectedFuel && displayPrice !== null && (
                  <div
                    className={cn(
                      "absolute rounded bg-white px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap shadow",
                      isCheapest || isExpensive
                        ? "-top-8 left-1/2 -translate-x-1/2"
                        : "-top-6 left-1/2 -translate-x-1/2"
                    )}
                    style={{ color }}
                  >
                    {displayPrice.toFixed(2)}€
                  </div>
                )}
                {!hasSelectedFuel && stats?.mean && (
                  <div
                    className={cn(
                      "absolute rounded bg-white px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap shadow",
                      "-top-6 left-1/2 -translate-x-1/2"
                    )}
                  >
                    {stats.mean.toFixed(2)}€*
                  </div>
                )}
              </div>
            </MarkerContent>
          </MapMarker>
        )
      })}
    </>
  )
}

interface GasStationMapProps {
  className?: string
}

export function GasStationMap({ className }: GasStationMapProps) {
  const { mapStyle, theme: settingsTheme } = useSettingsStore()
  const { userLocation, viewport: storedViewport } = useMapStore()
  const {
    loading: locationLoading,
    permission,
    requestLocation,
  } = useGeolocation()

  const [isInitializing, setIsInitializing] = useState(true)
  const [hasAskedPermission, setHasAskedPermission] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  useEffect(() => {
    const checkLocation = async () => {
      const savedLocation = useMapStore.getState().userLocation

      if (savedLocation) {
        useMapStore.getState().setViewport({
          lng: savedLocation.lng,
          lat: savedLocation.lat,
          zoom: 12,
        })
        setHasAskedPermission(true)
        setIsInitializing(false)
        return
      }

      if (permission === "granted" && !hasAskedPermission) {
        try {
          const coords = await requestLocation()
          useMapStore.getState().setUserLocation({
            lng: coords.longitude,
            lat: coords.latitude,
          })
          useMapStore.getState().setViewport({
            lng: coords.longitude,
            lat: coords.latitude,
            zoom: 12,
          })
          setHasAskedPermission(true)
          setShowPermissionModal(false)
        } catch {
          setShowPermissionModal(true)
        }
      } else if (permission === "denied") {
        setShowPermissionModal(false)
      } else if (permission === "unknown" || permission === "prompt") {
        setShowPermissionModal(true)
      }

      setHasAskedPermission(true)
      setIsInitializing(false)
    }

    checkLocation()
  }, [permission, requestLocation, hasAskedPermission])

  const mapStyleUrl = MAP_STYLES[mapStyle] || MAP_STYLES["liberty"]
  const theme = settingsTheme === "system" ? undefined : settingsTheme

  const styles = {
    light: mapStyleUrl,
    dark: mapStyleUrl,
  }

  const handleLocationGranted = (coords: {
    latitude: number
    longitude: number
  }) => {
    setHasAskedPermission(true)
    setShowPermissionModal(false)
    useMapStore.getState().setUserLocation({
      lng: coords.longitude,
      lat: coords.latitude,
    })

    const provinceId = findProvinceByCoords(coords.latitude, coords.longitude)

    if (provinceId) {
      useMapStore.getState().setViewport({
        lng: coords.longitude,
        lat: coords.latitude,
        zoom: 12,
      })
    }
  }

  const handleLocationDenied = () => {
    setHasAskedPermission(true)
    setShowPermissionModal(false)
  }

  const handleStationClick = (station: EESSPrecio) => {
    useMapStore.getState().setSelectedStation(station.IDEESS)
  }

  const initialCenter: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : storedViewport
      ? [storedViewport.lng, storedViewport.lat]
      : [-3.70379, 40.416775]
  const initialZoom = userLocation
    ? 12
    : storedViewport
      ? storedViewport.zoom
      : 6

  return (
    <div className={cn("relative h-full w-full", className)}>
      {isInitializing ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="text-sm text-white/60">Cargando...</span>
          </div>
        </div>
      ) : (
        <Map
          center={initialCenter}
          zoom={initialZoom}
          theme={theme}
          styles={styles}
          loading={false}
        >
          <MapUpdater />
          <StationMarkersLayer onStationClick={handleStationClick} />
          <RouteLayer />
          <MapControls position="top-right" showZoom showLocate showCompass />
        </Map>
      )}

      {showPermissionModal && !isInitializing && hasAskedPermission && (
        <LocationPermission
          onGranted={handleLocationGranted}
          onDenied={handleLocationDenied}
          loading={locationLoading}
        />
      )}
    </div>
  )
}
