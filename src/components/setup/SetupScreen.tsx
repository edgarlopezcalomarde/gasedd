import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { FUEL_TYPES } from "@/lib/fuel-types"
import { useFilterStore } from "@/stores/filterStore"
import { Fuel, Droplets, ChevronDown, Check, Loader2 } from "lucide-react"
import { useState } from "react"

interface SetupScreenProps {
  onComplete: () => void
  onSkip: () => void
}

export function SetupScreen({ onComplete, onSkip }: SetupScreenProps) {
  const { selectedFuel, setSelectedFuel, tankCapacity, setTankCapacity } =
    useFilterStore()
  const [showFuelPicker, setShowFuelPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedFuelType = FUEL_TYPES.find((f) => f.id === selectedFuel)

  const handleComplete = () => {
    if (!selectedFuel) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onComplete()
    }, 500)
  }

  const handleSkip = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSkip()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-sm px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
              <Fuel className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">GasEdd</h1>
            <p className="mt-2 text-white/50">Configura tu combustible</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Tipo de combustible
              </label>
              <button
                onClick={() => setShowFuelPicker(!showFuelPicker)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors",
                  !selectedFuel && "text-white/30"
                )}
              >
                <span className="flex items-center gap-3">
                  {selectedFuelType ? (
                    <>
                      <Fuel className="h-5 w-5 text-yellow-400" />
                      <span>{selectedFuelType.name}</span>
                    </>
                  ) : (
                    <span>Selecciona un combustible</span>
                  )}
                </span>
                <ChevronDown className="h-5 w-5 text-white/50" />
              </button>

              {showFuelPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-black/90 backdrop-blur-2xl"
                >
                  {FUEL_TYPES.slice(0, 10).map((fuel) => (
                    <button
                      key={fuel.id}
                      onClick={() => {
                        setSelectedFuel(fuel.id)
                        setShowFuelPicker(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10",
                        selectedFuel === fuel.id &&
                          "bg-yellow-500/10 text-yellow-400"
                      )}
                    >
                      <Fuel className="h-5 w-5" />
                      <span className="flex-1">{fuel.name}</span>
                      {selectedFuel === fuel.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Capacidad del depósito (opcional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(Number(e.target.value))}
                  className="flex-1 accent-yellow-400"
                />
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white">
                  <Droplets className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{tankCapacity}L</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-colors",
                "bg-yellow-500 text-black hover:bg-yellow-400"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Continuar"
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent py-3 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              Omitir
            </button>
          </div>

          <p className="text-center text-xs text-white/20">
            Puedes cambiar estos ajustes más adelante desde Ajustes
          </p>
        </motion.div>
      </div>
    </div>
  )
}
