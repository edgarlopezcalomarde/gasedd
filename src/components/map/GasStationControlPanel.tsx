import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
import { useStationStore, useMapStore } from "@/stores"
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  Loader2,
  Route,
  Star,
} from "lucide-react"

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

interface ControlPanelProps {
  className?: string
  onOpenStationDetail?: (stationId: string) => void
}

export function GasStationControlPanel({
  className,
  onOpenStationDetail,
}: ControlPanelProps) {
  const stationsQuery = useStationsByProvinces(ALL_PROVINCE_IDS)
  const { cheapestStationId, expensiveStationId } = useStationStore()
  const { viewStats, userLocation, setRouteToStationId } = useMapStore()

  const handleShowRoute = () => {
    if (cheapestStationId && userLocation) {
      setRouteToStationId(cheapestStationId)
    }
  }

  return (
    <motion.div
      className={cn(
        "fixed bottom-4 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 px-4",
        className
      )}
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 220, delay: 0.3 }}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/65 shadow-2xl backdrop-blur-2xl">
        <AnimatePresence>
          {stationsQuery.isLoading && (
            <motion.div
              className="flex items-center gap-2 border-b border-white/10 px-4 py-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-white/50" />
              <span className="text-xs text-white/50">
                Cargando gasolineras...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-center">
              <motion.div
                key={viewStats?.count || 0}
                className="text-2xl font-bold text-white tabular-nums"
                initial={{ scale: 1.4, color: "#22c55e" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                {viewStats?.count || 0}
              </motion.div>
              <div className="mt-0.5 text-[10px] tracking-wider text-white/40 uppercase">
                gasolineras
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="text-center">
              <div className="flex items-center gap-1 text-2xl font-bold text-green-400 tabular-nums">
                <TrendingDown size={16} />
                {viewStats?.min.toFixed(3) || "--"}
              </div>
              <div className="mt-0.5 text-[10px] tracking-wider text-white/40 uppercase">
                más barato
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="text-center">
              <div className="flex items-center gap-1 text-2xl font-bold text-red-400 tabular-nums">
                <TrendingUp size={16} />
                {viewStats?.max.toFixed(3) || "--"}
              </div>
              <div className="mt-0.5 text-[10px] tracking-wider text-white/40 uppercase">
                más caro
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500/15 py-2.5 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-500/25"
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                cheapestStationId && onOpenStationDetail?.(cheapestStationId)
              }
              disabled={!cheapestStationId}
            >
              <Star size={14} />
              <span>Más barato</span>
            </motion.button>

            <motion.button
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500/15 py-2.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/25"
              whileTap={{ scale: 0.96 }}
              onClick={handleShowRoute}
              disabled={!cheapestStationId || !userLocation}
            >
              <Route size={14} />
              <span>Ruta</span>
            </motion.button>

            <motion.button
              className="flex items-center justify-center rounded-xl bg-white/5 px-3 py-2.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                expensiveStationId && onOpenStationDetail?.(expensiveStationId)
              }
              disabled={!expensiveStationId}
            >
              <Fuel size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
