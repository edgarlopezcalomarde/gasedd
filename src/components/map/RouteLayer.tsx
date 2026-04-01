import { useMemo } from "react"
import { MapRoute } from "@/components/ui/map"
import { useMapStore, useStationDataStore } from "@/stores"
import { useFilterStore } from "@/stores/filterStore"
import { getFuelTypeById, DEFAULT_FUEL_KEY } from "@/lib/fuel-types"
import { findCheapestStation } from "@/lib/price-utils"
import type { EESSPrecio } from "@/api/types"

export function RouteLayer() {
  const { userLocation, showRoute, routeToStationId } = useMapStore()
  const { selectedFuel } = useFilterStore()
  const { stations } = useStationDataStore()

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY

  const routeCoordinates = useMemo(() => {
    if (!showRoute || !userLocation) return [] as [number, number][]
    if (!stations || stations.length === 0) return [] as [number, number][]

    let targetStation: EESSPrecio | null = null

    if (routeToStationId) {
      const found = stations.find((s) => s.IDEESS === routeToStationId)
      targetStation = found || null
    } else {
      targetStation = findCheapestStation(stations, fuelKey)
    }

    if (!targetStation) return [] as [number, number][]

    const targetLng = parseFloat(
      targetStation["Longitud (WGS84)"]?.replace(",", ".") || "0"
    )
    const targetLat = parseFloat(
      targetStation.Latitud?.replace(",", ".") || "0"
    )

    if (isNaN(targetLng) || isNaN(targetLat)) return [] as [number, number][]

    return [
      [userLocation.lng, userLocation.lat] as [number, number],
      [targetLng, targetLat] as [number, number],
    ]
  }, [showRoute, userLocation, routeToStationId, stations, fuelKey])

  if (!showRoute || routeCoordinates.length < 2) return null

  return (
    <MapRoute
      id="user-to-station"
      coordinates={routeCoordinates}
      color="#22c55e"
      width={4}
      opacity={0.9}
    />
  )
}
