import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "motion/react"
import { GasStationMap } from "@/components/map/GasStationMap"
import { GasStationControlPanel } from "@/components/map/GasStationControlPanel"
import { NavigationBar, DEFAULT_TABS } from "@/components/ui/navigation-bar"
import { FiltersPanel } from "@/components/filters/FuelSelector"
import { CacheSettings } from "@/components/filters/CacheSettings"
import { StationDetail } from "@/components/station/StationDetail"
import { FuelCalculator } from "@/components/calculator/FuelCalculator"
import { useMapStore, useStationDataStore } from "@/stores"
import { Settings as SettingsIcon, X } from "lucide-react"

export function App() {
  const [activeTab, setActiveTab] = useState("map")
  const { selectedStationId, setSelectedStation } = useMapStore()
  const { stations } = useStationDataStore()

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null
    return stations.find((s) => s.IDEESS === selectedStationId) || null
  }, [selectedStationId, stations])

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
            <CacheSettings />
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
          const station = stations.find((s) => s.IDEESS === stationId)
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
