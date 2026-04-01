import { useState, useEffect, useMemo, useRef } from "react"
import MapLibreGL from "maplibre-gl"
import { Map, MapControls, useMap } from "@/components/ui/map"
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
import { Loader2, MapPin, Fuel, Star, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { RouteLayer } from "./RouteLayer"

const SOURCE_ID = "gasedd-stations"
const CIRCLES_LAYER = "gasedd-circles"
const SPECIAL_LAYER = "gasedd-special"
const LABELS_LAYER = "gasedd-labels"
const ICONS_LAYER = "gasedd-icons"

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
  const { stations } = useStationDataStore()

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

interface HoverInfo {
  rotulo: string
  provincia: string
  priceStr: string
  color: string
  isCheapest: boolean
  isExpensive: boolean
}

function StationMarkersLayer({
  onStationClick,
}: {
  onStationClick?: (station: EESSPrecio) => void
}) {
  const { isLoaded, getBounds, map } = useMap()
  const { bounds, setViewStats, setVisibleProvinces } = useMapStore()
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
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onStationClickRef = useRef(onStationClick)
  useEffect(() => {
    onStationClickRef.current = onStationClick
  })

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY

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
    if (!stationsInView || stationsInView.length === 0) {
      setViewStats(null)
      return null
    }
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

  // Build GeoJSON from stations in view — rendered by MapLibre on WebGL canvas
  const geojsonData = useMemo((): GeoJSON.FeatureCollection => {
    if (stationsInView.length === 0)
      return { type: "FeatureCollection", features: [] }

    const features: GeoJSON.Feature<GeoJSON.Point>[] = []

    for (const station of stationsInView) {
      const lng = parseFloat(
        station["Longitud (WGS84)"]?.replace(",", ".") || "0"
      )
      const lat = parseFloat(station.Latitud?.replace(",", ".") || "0")
      if (isNaN(lng) || isNaN(lat)) continue

      const price = getFuelPrice(
        station as unknown as Record<string, string | undefined>,
        fuelKey
      )
      const isCheapest = station.IDEESS === cheapestStationId ? 1 : 0
      const isExpensive = station.IDEESS === expensiveStationId ? 1 : 0

      let color: string = PRICE_COLORS.medium
      if (price !== null && stats) {
        if (price <= stats.p33) color = PRICE_COLORS.low as string
        else if (price >= stats.p66) color = PRICE_COLORS.high as string
      }

      const displayPrice = hasSelectedFuel ? price : (stats?.mean ?? null)
      const priceLabel =
        displayPrice !== null ? `${displayPrice.toFixed(2)}€` : ""
      const displayPriceStr =
        displayPrice !== null ? `${displayPrice.toFixed(3)} €/L` : "--"
      const icon =
        isCheapest === 1 ? "★" : isExpensive === 1 ? "!" : ""

      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: {
          id: station.IDEESS,
          color,
          isCheapest,
          isExpensive,
          priceLabel,
          displayPriceStr,
          rotulo: station.Rótulo || "Gasolinera",
          provincia: station.Provincia || "",
          icon,
        },
      })
    }

    return { type: "FeatureCollection", features }
  }, [
    stationsInView,
    fuelKey,
    stats,
    cheapestStationId,
    expensiveStationId,
    hasSelectedFuel,
  ])

  // Initialize MapLibre source and layers (WebGL — no DOM overhead)
  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      })
    }

    if (!map.getLayer(CIRCLES_LAYER)) {
      map.addLayer({
        id: CIRCLES_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: [
          "all",
          ["==", ["get", "isCheapest"], 0],
          ["==", ["get", "isExpensive"], 0],
        ],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            3,
            10,
            5,
            13,
            7,
            16,
            10,
          ],
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0.5,
            10,
            1,
            13,
            2,
          ],
          "circle-stroke-color": "rgba(255,255,255,0.7)",
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0.75,
            13,
            0.95,
          ],
        },
      })
    }

    if (!map.getLayer(SPECIAL_LAYER)) {
      map.addLayer({
        id: SPECIAL_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: [
          "any",
          ["==", ["get", "isCheapest"], 1],
          ["==", ["get", "isExpensive"], 1],
        ],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            6,
            10,
            9,
            13,
            12,
            16,
            15,
          ],
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            1.5,
            13,
            3,
          ],
          "circle-stroke-color": "rgba(255,255,255,1)",
          "circle-opacity": 1,
        },
      })
    }

    // Price labels — only visible at zoom >= 13
    if (!map.getLayer(LABELS_LAYER)) {
      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 10,
        filter: ["!=", ["get", "priceLabel"], ""],
        layout: {
          "text-field": ["get", "priceLabel"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            8,
            13,
            10,
            16,
            13,
          ],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-offset": [0, -1.8],
          "text-anchor": "bottom",
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": ["get", "color"],
          "text-halo-color": "rgba(0,0,0,0.9)",
          "text-halo-width": 1.5,
        },
      })
    }

    if (!map.getLayer(ICONS_LAYER)) {
      map.addLayer({
        id: ICONS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 6,
        filter: ["!=", ["get", "icon"], ""],
        layout: {
          "text-field": ["get", "icon"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            10,
            10,
            12,
            13,
            14,
            16,
            18,
          ],
          "text-offset": [0, 0],
          "text-anchor": "center",
          "text-allow-overlap": true,
          "icon-allow-overlap": true,
        },
        paint: {
          "text-color": "rgba(255,255,255,1)",
          "text-halo-color": "rgba(0,0,0,0.2)",
          "text-halo-width": 0.5,
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0.9,
            13,
            1,
          ],
        },
      })
    }

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer"
        const props = e.features[0].properties as {
          rotulo: string
          provincia: string
          displayPriceStr: string
          color: string
          isCheapest: number
          isExpensive: number
        }
        setHoverInfo({
          rotulo: props.rotulo || "Gasolinera",
          provincia: props.provincia || "",
          priceStr: props.displayPriceStr || "--",
          color: props.color || PRICE_COLORS.medium,
          isCheapest: props.isCheapest === 1,
          isExpensive: props.isExpensive === 1,
        })
      }
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ""
      setHoverInfo(null)
    }

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const id = (e.features[0].properties as { id?: string })?.id
        if (id) {
          const station = useStationDataStore
            .getState()
            .stations.find((s) => s.IDEESS === id)
          if (station) onStationClickRef.current?.(station)
        }
      }
    }

    map.on("mousemove", CIRCLES_LAYER, handleMouseMove)
    map.on("mousemove", SPECIAL_LAYER, handleMouseMove)
    map.on("mouseleave", CIRCLES_LAYER, handleMouseLeave)
    map.on("mouseleave", SPECIAL_LAYER, handleMouseLeave)
    map.on("click", CIRCLES_LAYER, handleClick)
    map.on("click", SPECIAL_LAYER, handleClick)

    return () => {
      map.off("mousemove", CIRCLES_LAYER, handleMouseMove)
      map.off("mousemove", SPECIAL_LAYER, handleMouseMove)
      map.off("mouseleave", CIRCLES_LAYER, handleMouseLeave)
      map.off("mouseleave", SPECIAL_LAYER, handleMouseLeave)
      map.off("click", CIRCLES_LAYER, handleClick)
      map.off("click", SPECIAL_LAYER, handleClick)

      try {
        if (map.getLayer(ICONS_LAYER)) map.removeLayer(ICONS_LAYER)
        if (map.getLayer(LABELS_LAYER)) map.removeLayer(LABELS_LAYER)
        if (map.getLayer(SPECIAL_LAYER)) map.removeLayer(SPECIAL_LAYER)
        if (map.getLayer(CIRCLES_LAYER)) map.removeLayer(CIRCLES_LAYER)
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
      } catch {
        // Map may be destroyed during cleanup
      }

      map.getCanvas().style.cursor = ""
    }
  }, [isLoaded, map])

  // Push updated GeoJSON to the MapLibre source
  useEffect(() => {
    if (!map || !isLoaded) return
    const source = map.getSource(SOURCE_ID) as
      | MapLibreGL.GeoJSONSource
      | undefined
    source?.setData(geojsonData)
  }, [map, isLoaded, geojsonData])

  if (!isLoaded) return null

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

      {hoverInfo && (
        <div className="pointer-events-none absolute bottom-36 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${hoverInfo.color}20` }}
            >
              {hoverInfo.isCheapest ? (
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
              ) : hoverInfo.isExpensive ? (
                <AlertTriangle size={16} className="text-red-400" />
              ) : (
                <Fuel size={16} style={{ color: hoverInfo.color }} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {hoverInfo.rotulo}
              </p>
              <p className="text-xs text-white/50">{hoverInfo.provincia}</p>
            </div>
            <div
              className="ml-3 text-lg font-bold tabular-nums"
              style={{ color: hoverInfo.color }}
            >
              {hoverInfo.priceStr}
            </div>
          </div>
        </div>
      )}
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
