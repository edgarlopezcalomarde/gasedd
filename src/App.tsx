import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "motion/react"
import { GasStationMap } from "@/components/map/GasStationMap"
import { GasStationControlPanel } from "@/components/map/GasStationControlPanel"
import { NavigationBar, DEFAULT_TABS } from "@/components/ui/navigation-bar"
import { FiltersPanel } from "@/components/filters/FuelSelector"
import { StationDetail } from "@/components/station/StationDetail"
import { FuelCalculator } from "@/components/calculator/FuelCalculator"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
import { useMapStore } from "@/stores"
import { Settings as SettingsIcon, X } from "lucide-react"

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

export function App() {
  const [activeTab, setActiveTab] = useState("map")
  const stationsQuery = useStationsByProvinces(ALL_PROVINCE_IDS)
  const { selectedStationId, setSelectedStation } = useMapStore()

  const selectedStation = useMemo(() => {
    if (!selectedStationId || !stationsQuery.data) return null
    return (
      stationsQuery.data.find((s) => s.IDEESS === selectedStationId) || null
    )
  }, [selectedStationId, stationsQuery.data])

  const handleCloseStationDetail = () => {
    setSelectedStation(null)
    if (activeTab === "stations") {
      setActiveTab("map")
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return (
          <div className="p-4 pb-24">
            <FuelCalculator />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-4 px-4 pt-8 pb-24">
            <div className="flex items-center gap-2">
              <SettingsIcon size={18} className="text-white/50" />
              <h3 className="text-lg font-semibold text-white">Ajustes</h3>
            </div>
            <FiltersPanel />
          </div>
        )
      default:
        return (
          <div className="p-4">
            <FiltersPanel />
          </div>
        )
    }
  }

  const showBottomSheet = activeTab !== "map" && activeTab !== "stations"

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      <div className="relative flex-1">
        <GasStationMap className="h-full w-full" />
      </div>

      <AnimatePresence>
        {showBottomSheet && (
          <motion.div
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTab("map")}
          >
            <motion.div
              className="relative flex max-h-[90vh] min-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0">
                <button
                  onClick={() => setActiveTab("map")}
                  className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/50"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderContent()}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GasStationControlPanel
        onOpenStationDetail={(id) => {
          setSelectedStation(id)
        }}
        onCenterOnStation={(stationId) => {
          const station = stationsQuery.data?.find(
            (s) => s.IDEESS === stationId
          )
          if (station) {
            const lng = parseFloat(
              station["Longitud (WGS84)"]?.replace(",", ".") || "0"
            )
            const lat = parseFloat(station.Latitud?.replace(",", ".") || "0")
            if (!isNaN(lng) && !isNaN(lat)) {
              useMapStore.getState().setViewport({ lng, lat, zoom: 14 })
            }
          }
        }}
      />
      <NavigationBar
        tabs={DEFAULT_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <StationDetail
        station={selectedStation}
        isOpen={!!selectedStation}
        onClose={handleCloseStationDetail}
      />
    </div>
  )
}

export default App
