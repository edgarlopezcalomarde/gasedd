import { useMemo } from "react"
import { MapRoute } from "@/components/ui/map"
import { useMapStore } from "@/stores"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
import { useFilterStore } from "@/stores/filterStore"
import { getFuelTypeById, DEFAULT_FUEL_KEY } from "@/lib/fuel-types"
import { findCheapestStation } from "@/lib/price-utils"

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

export function RouteLayer() {
  const { userLocation, showRoute, routeToStationId, visibleProvinces } =
    useMapStore()
  const { selectedFuel } = useFilterStore()
  const stationsQuery = useStationsByProvinces(
    visibleProvinces.length > 0 ? visibleProvinces : ALL_PROVINCE_IDS
  )

  const fuelKey = getFuelTypeById(selectedFuel || "")?.key || DEFAULT_FUEL_KEY

  const routeCoordinates = useMemo(() => {
    if (!showRoute || !userLocation) return [] as [number, number][]

    let targetStation = null

    if (routeToStationId && stationsQuery.data) {
      targetStation = stationsQuery.data.find(
        (s) => s.IDEESS === routeToStationId
      )
    } else if (stationsQuery.data && stationsQuery.data.length > 0) {
      targetStation = findCheapestStation(stationsQuery.data, fuelKey)
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
  }, [showRoute, userLocation, routeToStationId, stationsQuery.data, fuelKey])

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
