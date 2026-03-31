import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import {
  getFuelPrice,
  FUEL_TYPES,
  DEFAULT_FUEL_KEY,
  type FuelTypeKey,
} from "@/lib/fuel-types"
import { useFilterStore } from "@/stores/filterStore"
import { useMapStore } from "@/stores"
import type { EESSPrecio } from "@/api/types"
import {
  X,
  MapPin,
  Clock,
  Fuel,
  Navigation,
  Lock,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useMemo, useState } from "react"

interface StationDetailProps {
  station: EESSPrecio | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function StationDetail({
  station,
  isOpen,
  onClose,
  className,
}: StationDetailProps) {
  const { selectedFuel } = useFilterStore()
  const { isBlocked, setBlocked } = useMapStore()
  const [showAllPrices, setShowAllPrices] = useState(false)

  const fuelKey: FuelTypeKey = (selectedFuel as FuelTypeKey) || DEFAULT_FUEL_KEY

  const currentPrice = useMemo(() => {
    if (!station) return null
    return getFuelPrice(
      station as unknown as Record<string, string | undefined>,
      fuelKey
    )
  }, [station, fuelKey])

  const allPrices = useMemo(() => {
    if (!station) return []
    return FUEL_TYPES.map((fuel) => {
      const price = getFuelPrice(
        station as unknown as Record<string, string | undefined>,
        fuel.key
      )
      return { ...fuel, price }
    }).filter((p) => p.price !== null)
  }, [station])

  const maxPrice = useMemo(() => {
    if (allPrices.length === 0) return null
    return Math.max(...allPrices.map((p) => p.price!))
  }, [allPrices])

  const minPrice = useMemo(() => {
    if (allPrices.length === 0) return null
    return Math.min(...allPrices.map((p) => p.price!))
  }, [allPrices])

  if (!station) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-40 flex items-end justify-center",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Fuel size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {station.Rótulo || "Gasolinera"}
                  </h3>
                  <p className="text-xs text-white/50">{station.Provincia}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="mb-4 space-y-2">
                <div className="flex items-start gap-2 text-white/70">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="text-sm">{station.Dirección}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Clock size={14} className="shrink-0" />
                  <span className="text-sm">
                    {station.Horario || "Sin horario"}
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-white/60">Precio actual</span>
                  {currentPrice !== null && (
                    <div className="flex items-center gap-1">
                      {currentPrice === minPrice && (
                        <TrendingDown size={14} className="text-green-400" />
                      )}
                      {currentPrice === maxPrice && (
                        <TrendingUp size={14} className="text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-white">
                  {currentPrice !== null
                    ? `${currentPrice.toFixed(3)} €/L`
                    : "--"}
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setShowAllPrices(!showAllPrices)}
                  className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
                >
                  <span>Todos los precios ({allPrices.length})</span>
                  <motion.span
                    animate={{ rotate: showAllPrices ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showAllPrices && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {allPrices.map((fuel) => (
                          <div
                            key={fuel.id}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-3 py-2",
                              fuel.id === selectedFuel && "bg-white/10"
                            )}
                          >
                            <span className="text-sm text-white/70">
                              {fuel.name}
                            </span>
                            <span className="font-mono text-sm text-white">
                              {fuel.price?.toFixed(3)} €/L
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <motion.button
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500/15 py-2.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/25"
                  whileTap={{ scale: 0.98 }}
                >
                  <Navigation size={14} />
                  <span>Cómo llegar</span>
                </motion.button>

                <motion.button
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    isBlocked
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  )}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBlocked(!isBlocked)}
                >
                  <Lock size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
