import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "motion/react"
import { GasStationMap } from "@/components/map/GasStationMap"
import { GasStationControlPanel } from "@/components/map/GasStationControlPanel"
import { PriceThermometer } from "@/components/map/PriceThermometer"
import { NavigationBar, DEFAULT_TABS } from "@/components/ui/navigation-bar"
import { FiltersPanel } from "@/components/filters/FuelSelector"
import { StationDetail } from "@/components/station/StationDetail"
import { FuelCalculator } from "@/components/calculator/FuelCalculator"
import { PriceHistoryChart } from "@/components/station/PriceHistoryChart"
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
  const { selectedStationId, setSelectedStation, showLocationPrompt } =
    useMapStore()

  const selectedStation = useMemo(() => {
    if (!selectedStationId || !stationsQuery.data) return null
    return (
      stationsQuery.data.find((s) => s.IDEESS === selectedStationId) || null
    )
  }, [selectedStationId, stationsQuery.data])

  const handleCloseStationDetail = () => {
    setSelectedStation(null)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <FuelCalculator />
      case "history":
        return (
          <div className="p-4">
            <PriceHistoryChart
              stationId={selectedStationId || undefined}
              currentPrice={null}
            />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-4 p-4">
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

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      <div className="relative flex-1">
        <GasStationMap className="h-full w-full" />
        {!showLocationPrompt && <PriceThermometer />}
      </div>

      <AnimatePresence>
        {activeTab !== "map" && activeTab !== "stations" && (
          <motion.div
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTab("map")}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveTab("map")}
                className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/50"
              >
                <X size={14} />
              </button>
              {renderContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLocationPrompt && (
        <>
          <GasStationControlPanel
            onOpenStationDetail={(id) => {
              setSelectedStation(id)
              setActiveTab("stations")
            }}
          />

          <NavigationBar
            tabs={DEFAULT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      )}

      <StationDetail
        station={selectedStation}
        isOpen={activeTab === "stations" && !!selectedStation}
        onClose={handleCloseStationDetail}
      />
    </div>
  )
}

export default App
