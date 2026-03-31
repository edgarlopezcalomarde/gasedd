import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { FUEL_TYPES, type FuelType } from "@/lib/fuel-types"
import { useFilterStore } from "@/stores/filterStore"
import { useSettingsStore } from "@/stores"
import { Fuel, ChevronDown, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface FuelSelectorProps {
  className?: string
}

export function FuelSelector({ className }: FuelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { selectedFuel, setSelectedFuel } = useFilterStore()
  const { setDefaultFuel } = useSettingsStore()

  const selectedType = FUEL_TYPES.find((f) => f.id === selectedFuel)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (fuel: FuelType) => {
    setSelectedFuel(fuel.id)
    setDefaultFuel(fuel.id)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
        whileTap={{ scale: 0.98 }}
      >
        <Fuel size={16} className="text-white/50" />
        <span>{selectedType?.name || "Seleccionar"}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-white/50" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="max-h-64 overflow-y-auto p-1">
              {FUEL_TYPES.map((fuel) => (
                <motion.button
                  key={fuel.id}
                  onClick={() => handleSelect(fuel)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    selectedFuel === fuel.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-start">
                    <span>{fuel.name}</span>
                    <span className="text-[10px] text-white/40">
                      {fuel.category}
                    </span>
                  </div>
                  {selectedFuel === fuel.id && (
                    <Check size={14} className="text-green-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface TankCapacityInputProps {
  className?: string
}

export function TankCapacityInput({ className }: TankCapacityInputProps) {
  const { tankCapacity, setTankCapacity } = useFilterStore()
  const { setTankCapacity: setSettingsCapacity } = useSettingsStore()

  const handleChange = (value: number) => {
    const clamped = Math.max(10, Math.min(100, value))
    setTankCapacity(clamped)
    setSettingsCapacity(clamped)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-white/40">Depósito:</span>
      <div className="flex items-center gap-1">
        <motion.button
          onClick={() => handleChange(tankCapacity - 5)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
          whileTap={{ scale: 0.9 }}
        >
          -
        </motion.button>
        <span className="w-12 text-center text-sm font-medium text-white">
          {tankCapacity}L
        </span>
        <motion.button
          onClick={() => handleChange(tankCapacity + 5)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
      </div>
    </div>
  )
}

interface FiltersPanelProps {
  className?: string
}

export function FiltersPanel({ className }: FiltersPanelProps) {
  return (
    <motion.div
      className={cn("flex items-center gap-2", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <FuelSelector />
      <TankCapacityInput />
    </motion.div>
  )
}
