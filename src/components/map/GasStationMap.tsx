import { useState, useEffect, useMemo, useRef } from "react"
import { motion } from "motion/react"
import {
  Map,
  MapControls,
  useMap,
  MapMarker,
  MarkerContent,
} from "@/components/ui/map"
import { useSettingsStore, useMapStore, useStationStore } from "@/stores"
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
import { MAP_STYLES, PRICE_COLORS } from "@/lib/constants"
import type { EESSPrecio } from "@/api/types"
import { Loader2, MapPin, Navigation, Star, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { RouteLayer } from "./RouteLayer"

const ALL_PROVINCE_IDS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
]

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
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
            <MapPin className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">
            ¿Dónde estás?
          </h2>
          <p className="text-sm text-white/50">
            Para mostrarte las gasolineras más cercanas, necesitamos acceso a tu
            ubicación.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 text-sm font-medium text-black transition-colors hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Permitir ubicación
          </button>

          <button
            onClick={onDenied}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Ahora no
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const PROVINCE_BOUNDS: Record<
  string,
  { latMin: number; latMax: number; lngMin: number; lngMax: number }
> = {
  "01": { latMin: 42.5, latMax: 43.5, lngMin: -3.0, lngMax: -1.0 },
  "02": { latMin: 38.5, latMax: 40.0, lngMin: -2.5, lngMax: -1.0 },
  "03": { latMin: 38.0, latMax: 39.5, lngMin: -1.5, lngMax: 0.0 },
  "04": { latMin: 36.5, latMax: 37.5, lngMin: -2.5, lngMax: -1.0 },
  "05": { latMin: 40.0, latMax: 41.5, lngMin: -6.0, lngMax: -4.0 },
  "06": { latMin: 40.0, latMax: 41.5, lngMin: -5.0, lngMax: -3.0 },
  "07": { latMin: 38.5, latMax: 39.5, lngMin: 0.0, lngMax: 1.5 },
  "08": { latMin: 41.0, latMax: 42.5, lngMin: 0.5, lngMax: 3.0 },
  "09": { latMin: 41.5, latMax: 43.0, lngMin: -4.5, lngMax: -2.5 },
  "10": { latMin: 38.5, latMax: 40.5, lngMin: -7.5, lngMax: -5.0 },
  "11": { latMin: 36.0, latMax: 37.0, lngMin: -7.5, lngMax: -5.0 },
  "12": { latMin: 39.0, latMax: 40.5, lngMin: -1.0, lngMax: 1.0 },
  "13": { latMin: 38.0, latMax: 39.5, lngMin: -4.0, lngMax: -2.0 },
  "14": { latMin: 37.0, latMax: 38.5, lngMin: -4.5, lngMax: -3.0 },
  "15": { latMin: 42.5, latMax: 44.0, lngMin: -9.0, lngMax: -7.0 },
  "16": { latMin: 39.5, latMax: 41.0, lngMin: -3.5, lngMax: -2.0 },
  "17": { latMin: 42.0, latMax: 43.5, lngMin: 2.0, lngMax: 4.0 },
  "18": { latMin: 36.5, latMax: 38.0, lngMin: -4.5, lngMax: -3.0 },
  "19": { latMin: 39.0, latMax: 41.0, lngMin: -3.5, lngMax: -1.0 },
  "20": { latMin: 43.0, latMax: 43.5, lngMin: -3.0, lngMax: -1.5 },
  "21": { latMin: 36.5, latMax: 38.0, lngMin: -5.0, lngMax: -3.5 },
  "22": { latMin: 41.5, latMax: 43.0, lngMin: -1.0, lngMax: 1.0 },
  "23": { latMin: 37.0, latMax: 38.5, lngMin: -4.0, lngMax: -2.0 },
  "24": { latMin: 40.5, latMax: 43.0, lngMin: -7.5, lngMax: -5.0 },
  "25": { latMin: 42.0, latMax: 43.0, lngMin: 0.0, lngMax: 2.0 },
  "26": { latMin: 36.5, latMax: 37.5, lngMin: -4.5, lngMax: -3.0 },
  "27": { latMin: 42.0, latMax: 43.5, lngMin: -7.5, lngMax: -6.0 },
  "28": { latMin: 40.0, latMax: 41.0, lngMin: -4.5, lngMax: -3.0 },
  "29": { latMin: 36.5, latMax: 37.5, lngMin: -5.0, lngMax: -4.0 },
  "30": { latMin: 37.5, latMax: 39.0, lngMin: -2.0, lngMax: -0.5 },
  "31": { latMin: 42.5, latMax: 43.5, lngMin: -2.5, lngMax: -1.0 },
  "32": { latMin: 42.5, latMax: 43.5, lngMin: -8.5, lngMax: -6.5 },
  "33": { latMin: 43.0, latMax: 44.0, lngMin: -6.0, lngMax: -4.5 },
  "34": { latMin: 42.0, latMax: 43.5, lngMin: -5.0, lngMax: -3.5 },
  "35": { latMin: 27.5, latMax: 29.5, lngMin: -18.0, lngMax: -13.0 },
  "36": { latMin: 42.0, latMax: 43.0, lngMin: -9.0, lngMax: -7.0 },
  "37": { latMin: 40.5, latMax: 42.0, lngMin: -7.0, lngMax: -5.0 },
  "38": { latMin: 28.0, latMax: 29.0, lngMin: -18.0, lngMax: -16.0 },
  "39": { latMin: 43.0, latMax: 44.0, lngMin: -4.5, lngMax: -3.0 },
  "40": { latMin: 41.0, latMax: 42.0, lngMin: -5.0, lngMax: -3.5 },
  "41": { latMin: 36.7, latMax: 38.5, lngMin: -6.0, lngMax: -2.5 },
  "42": { latMin: 41.5, latMax: 43.0, lngMin: -4.0, lngMax: -2.0 },
  "43": { latMin: 36.7, latMax: 37.5, lngMin: -4.5, lngMax: -2.5 },
  "44": { latMin: 42.5, latMax: 43.5, lngMin: -1.5, lngMax: 0.5 },
  "45": { latMin: 39.0, latMax: 40.5, lngMin: -4.5, lngMax: -2.0 },
  "46": { latMin: 39.0, latMax: 40.5, lngMin: -1.5, lngMax: 0.0 },
  "47": { latMin: 41.5, latMax: 42.5, lngMin: -5.5, lngMax: -4.0 },
  "48": { latMin: 43.0, latMax: 43.5, lngMin: -3.5, lngMax: -2.0 },
  "49": { latMin: 41.5, latMax: 42.5, lngMin: -6.0, lngMax: -5.0 },
  "50": { latMin: 41.5, latMax: 42.0, lngMin: -1.5, lngMax: 0.0 },
  "51": { latMin: 36.0, latMax: 37.5, lngMin: -6.0, lngMax: -4.5 },
  "52": { latMin: 36.5, latMax: 37.5, lngMin: -5.5, lngMax: -4.0 },
}

function findProvinceByCoords(
  latitude: number,
  longitude: number
): string | null {
  for (const [id, bounds] of Object.entries(PROVINCE_BOUNDS)) {
    if (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lngMin &&
      longitude <= bounds.lngMax
    ) {
      return id
    }
  }
  return null
}

function MapUpdater() {
  const { map, isLoaded } = useMap()
  const { setViewport, setBounds, isBlocked, selectedStationId } = useMapStore()
  const { setCheapestStation, setExpensiveStation } = useStationStore()
  const stationsQuery = useStationsByProvinces(ALL_PROVINCE_IDS)
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
    if (
      !map ||
      !isLoaded ||
      !stationsQuery.data ||
      stationsQuery.data.length === 0
    )
      return

    const cheapest = findCheapestStation(stationsQuery.data, fuelKey)
    const expensive = findExpensiveStation(stationsQuery.data, fuelKey)

    setCheapestStation(cheapest?.IDEESS ?? null)
    setExpensiveStation(expensive?.IDEESS ?? null)
  }, [
    stationsQuery.data,
    fuelKey,
    isLoaded,
    map,
    isBlocked,
    setCheapestStation,
    setExpensiveStation,
  ])

  useEffect(() => {
    if (!map || !isLoaded || !selectedStationId) return

    const station = stationsQuery.data?.find(
      (s) => s.IDEESS === selectedStationId
    )
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
  }, [selectedStationId, isLoaded, map, stationsQuery.data, isBlocked])

  return null
}

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

function StationMarkersLayer({
  onStationClick,
}: {
  onStationClick?: (station: EESSPrecio) => void
}) {
  const { isLoaded } = useMap()
  const { bounds, setViewStats, viewport, setVisibleProvinces } = useMapStore()
  const { selectedFuel } = useFilterStore()
  const {
    cheapestStationId,
    expensiveStationId,
    setCheapestStation,
    setExpensiveStation,
  } = useStationStore()

  const [debouncedBounds, setDebouncedBounds] = useState<
    [[number, number], [number, number]] | null
  >(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY
  const zoom = viewport?.zoom ?? 6
  const showMarkers = zoom >= 6

  const visibleProvinceIds = useMemo(() => {
    if (!bounds) return []
    return getProvincesInBounds(bounds)
  }, [bounds])

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

  const stationsQuery = useStationsByProvinces(visibleProvinceIds)

  const stationsInView = useMemo(() => {
    if (
      !stationsQuery.data ||
      stationsQuery.data.length === 0 ||
      !debouncedBounds
    )
      return []

    const [[minLng, minLat], [maxLng, maxLat]] = debouncedBounds

    return stationsQuery.data.filter((station) => {
      const lng = parseFloat(
        station["Longitud (WGS84)"]?.replace(",", ".") || "0"
      )
      const lat = parseFloat(station.Latitud?.replace(",", ".") || "0")
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    })
  }, [stationsQuery.data, debouncedBounds])

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

  if (!isLoaded || !showMarkers || visibleProvinceIds.length === 0) return null

  const displayStations = stationsInView.slice(0, 200)

  return (
    <>
      {stationsQuery.isLoading && (
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
  const {
    setShowLocationPrompt,
    userLocation,
    viewport: storedViewport,
  } = useMapStore()
  const {
    loading: locationLoading,
    permission,
    requestLocation,
  } = useGeolocation()

  const [showPermission, setShowPermission] = useState(true)
  const [hasAskedPermission, setHasAskedPermission] = useState(false)

  useEffect(() => {
    const savedLocation = useMapStore.getState().userLocation
    if (savedLocation) {
      setHasAskedPermission(true)
      useMapStore.getState().setViewport({
        lng: savedLocation.lng,
        lat: savedLocation.lat,
        zoom: 12,
      })
    }
  }, [])

  const mapStyleUrl = MAP_STYLES[mapStyle] || MAP_STYLES["liberty"]
  const theme = settingsTheme === "system" ? undefined : settingsTheme

  const styles = {
    light: mapStyleUrl,
    dark: mapStyleUrl,
  }

  useEffect(() => {
    if (permission === "granted" && !hasAskedPermission) {
      requestLocation()
        .then((coords) => {
          useMapStore.getState().setUserLocation({
            lng: coords.longitude,
            lat: coords.latitude,
          })
          useMapStore.getState().setViewport({
            lng: coords.longitude,
            lat: coords.latitude,
            zoom: 12,
          })
          setShowPermission(false)
          setShowLocationPrompt(false)
          setHasAskedPermission(true)
        })
        .catch(() => {
          setShowPermission(false)
          setShowLocationPrompt(false)
          setHasAskedPermission(true)
        })
    } else if (
      (permission === "unknown" || permission === "prompt") &&
      !hasAskedPermission
    ) {
      setShowPermission(true)
      setShowLocationPrompt(true)
      setHasAskedPermission(true)
    } else if (permission === "denied") {
      setShowPermission(false)
      setShowLocationPrompt(false)
    }
  }, [permission, hasAskedPermission, requestLocation, setShowLocationPrompt])

  const handleLocationGranted = (coords: {
    latitude: number
    longitude: number
  }) => {
    setShowPermission(false)
    setHasAskedPermission(true)
    setShowLocationPrompt(false)
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
    setShowPermission(false)
    setHasAskedPermission(true)
    setShowLocationPrompt(false)
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
        <MapControls position="bottom-right" showZoom showLocate showCompass />
      </Map>

      {showPermission &&
        (permission === "unknown" || permission === "prompt") && (
          <LocationPermission
            onGranted={handleLocationGranted}
            onDenied={handleLocationDenied}
            loading={locationLoading}
          />
        )}
    </div>
  )
}
