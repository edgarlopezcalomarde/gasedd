import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useFilterStore } from "@/stores/filterStore"
import { useSettingsStore, useMapStore, useStationDataStore } from "@/stores"
import type { EESSPrecio } from "@/api/types"
import {
  getFuelPrice,
  DEFAULT_FUEL_KEY,
  type FuelTypeKey,
  getFuelTypeById,
  FUEL_TYPES,
  type FuelType,
} from "@/lib/fuel-types"
import {
  Calculator,
  Fuel,
  ArrowLeftRight,
  AlertTriangle,
  ChevronDown,
} from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface FuelCalculatorProps {
  className?: string
}

type Mode = "euros" | "liters"

function StationSelector({
  stations,
  selectedStation,
  onSelect,
  fuelKey,
}: {
  stations: EESSPrecio[]
  selectedStation: EESSPrecio | null
  onSelect: (station: EESSPrecio) => void
  fuelKey: FuelTypeKey
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const sortedStations = useMemo(() => {
    return [...stations].sort((a, b) => {
      const priceA = getFuelPrice(
        a as unknown as Record<string, string | undefined>,
        fuelKey
      )
      const priceB = getFuelPrice(
        b as unknown as Record<string, string | undefined>,
        fuelKey
      )
      if (priceA === null && priceB === null) return 0
      if (priceA === null) return 1
      if (priceB === null) return -1
      return priceA - priceB
    })
  }, [stations, fuelKey])

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

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setButtonRect({ top: rect.top, left: rect.left, width: rect.width })
    }
    setIsOpen(!isOpen)
  }

  const selectedPrice = selectedStation
    ? getFuelPrice(
        selectedStation as unknown as Record<string, string | undefined>,
        fuelKey
      )
    : null

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/10"
      >
        <div className="flex flex-1 flex-col items-start">
          <span className="text-xs text-white/50 uppercase tracking-wide">Gasolinera</span>
          <span className="truncate font-medium">
            {selectedStation?.Rótulo || "Seleccionar gasolinera"}
          </span>
        </div>
        {selectedPrice !== null && (
          <span className="whitespace-nowrap rounded-lg bg-green-500/15 px-2 py-1 text-xs font-bold text-green-400">
            {selectedPrice.toFixed(3)}€
          </span>
        )}
        <ChevronDown size={16} className="shrink-0 text-white/30" />
      </button>

      {isOpen &&
        buttonRect &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed z-[200] max-h-64 w-64 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
            style={{
              top: buttonRect.top - 8,
              left: buttonRect.left,
            }}
          >
            <div className="max-h-48 overflow-y-auto p-1">
              {sortedStations.slice(0, 50).map((station, index) => {
                const price = getFuelPrice(
                  station as unknown as Record<string, string | undefined>,
                  fuelKey
                )
                const isSelected = selectedStation?.IDEESS === station.IDEESS
                const isCheapest = index === 0

                return (
                  <button
                    key={station.IDEESS}
                    onClick={() => {
                      onSelect(station)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="max-w-[180px] truncate">
                        {station.Rótulo}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {station.Localidad}, {station.Provincia}
                      </span>
                    </div>
                    {price !== null && (
                      <span
                        className={cn(
                          "font-medium",
                          isCheapest ? "text-green-400" : "text-white/60"
                        )}
                      >
                        {price.toFixed(3)}€
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  )
}

function FuelTypeSelector({
  selectedFuel,
  onSelect,
}: {
  selectedFuel: string | null
  onSelect: (fuel: FuelType) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedType = selectedFuel ? getFuelTypeById(selectedFuel) : null

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

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setButtonRect({ top: rect.top, left: rect.left, width: rect.width })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/10"
      >
        <div className="flex flex-1 flex-col items-start">
          <span className="text-xs text-white/50 uppercase tracking-wide">Combustible</span>
          <span className="font-medium">{selectedType?.name || "Seleccionar combustible"}</span>
        </div>
        <ChevronDown size={16} className="shrink-0 text-white/30" />
      </button>

      {isOpen &&
        buttonRect &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed z-[200] max-h-64 w-64 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
            style={{
              top: buttonRect.top - 8,
              left: buttonRect.left,
            }}
          >
            <div className="max-h-48 overflow-y-auto p-1">
              {FUEL_TYPES.map((fuel) => {
                const isSelected = selectedFuel === fuel.id

                return (
                  <button
                    key={fuel.id}
                    onClick={() => {
                      onSelect(fuel)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span>{fuel.name}</span>
                      <span className="text-[10px] text-white/40">
                        {fuel.category}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  )
}

export function FuelCalculator({ className }: FuelCalculatorProps) {
  const [mode, setMode] = useState<Mode>("euros")
  const [inputValue, setInputValue] = useState("")
  const [selectedStation, setSelectedStation] = useState<EESSPrecio | null>(
    null
  )

  const { stations } = useStationDataStore()
  const { selectedFuel, setSelectedFuel, tankCapacity } = useFilterStore()
  const { setDefaultFuel } = useSettingsStore()
  const { viewStats } = useMapStore()

  const selectedFuelType = selectedFuel ? getFuelTypeById(selectedFuel) : null
  const fuelKey: FuelTypeKey = selectedFuelType?.key || DEFAULT_FUEL_KEY

  const cheapestInView = useMemo(() => {
    if (!stations || stations.length === 0) return null

    const sorted = [...stations].sort((a, b) => {
      const priceA = getFuelPrice(
        a as unknown as Record<string, string | undefined>,
        fuelKey
      )
      const priceB = getFuelPrice(
        b as unknown as Record<string, string | undefined>,
        fuelKey
      )
      if (priceA === null && priceB === null) return 0
      if (priceA === null) return 1
      if (priceB === null) return -1
      return priceA - priceB
    })

    return sorted[0] || null
  }, [stations, fuelKey])

  useEffect(() => {
    if (cheapestInView && !selectedStation) {
      setSelectedStation(cheapestInView)
    }
  }, [cheapestInView, selectedStation])

  const currentPrice = useMemo(() => {
    if (selectedStation) {
      return getFuelPrice(
        selectedStation as unknown as Record<string, string | undefined>,
        fuelKey
      )
    }

    if (viewStats?.mean) {
      return viewStats.mean
    }

    return null
  }, [selectedStation, viewStats?.mean, fuelKey])

  const parsedValue = parseFloat(inputValue.replace(",", ".")) || 0

  const result = useMemo(() => {
    if (!currentPrice || !parsedValue || parsedValue <= 0) {
      return { liters: 0, euros: 0, exceeds: false }
    }

    if (mode === "euros") {
      const liters = parsedValue / currentPrice
      return {
        liters,
        euros: parsedValue,
        exceeds: liters > tankCapacity,
      }
    } else {
      const euros = parsedValue * currentPrice
      return {
        liters: parsedValue,
        euros,
        exceeds: parsedValue > tankCapacity,
      }
    }
  }, [mode, parsedValue, currentPrice, tankCapacity])

  const handleModeSwitch = () => {
    setMode(mode === "euros" ? "liters" : "euros")
    setInputValue("")
  }

  const handleFuelSelect = (fuel: FuelType) => {
    setSelectedFuel(fuel.id)
    setDefaultFuel(fuel.id)
  }

  return (
    <motion.div
      className={cn("p-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-yellow-500/15 p-2">
          <Calculator size={20} className="text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Calculadora de combustible</h3>
          <p className="text-xs text-white/40">Calcula coste o cantidad</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-lg backdrop-blur-sm">
        <StationSelector
          stations={stations || []}
          selectedStation={selectedStation}
          onSelect={setSelectedStation}
          fuelKey={fuelKey}
        />

        <FuelTypeSelector
          selectedFuel={selectedFuel}
          onSelect={handleFuelSelect}
        />

        <div className="flex items-end gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={handleModeSwitch}
            className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-yellow-500/10 text-yellow-400 transition-colors hover:border-yellow-400/50 hover:bg-yellow-500/20"
            title="Cambiar modo"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-yellow-400/80 uppercase tracking-wide">
              {mode === "euros" ? "€" : "L"}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value
                if (val === "" || parseFloat(val) >= 0) {
                  setInputValue(val)
                }
              }}
              placeholder="0"
              className="bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-white/70">
            <Fuel size={16} className="text-yellow-400" />
            <span className="text-xs font-medium uppercase tracking-wide">
              {mode === "euros" ? "Litros" : "Coste total"}
            </span>
          </div>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              mode === "euros" ? "text-blue-400" : "text-green-400"
            )}
          >
            {mode === "euros"
              ? `${result.liters.toFixed(2)} L`
              : `${result.euros.toFixed(2)} €`}
          </span>
        </div>

        {currentPrice && (
          <div className="rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-white/60">
            <span className="font-mono font-medium text-white">
              {currentPrice.toFixed(3)} €/L
            </span>
            {selectedStation && (
              <span className="ml-2 text-white/40">• {selectedStation.Localidad}</span>
            )}
          </div>
        )}

        {result.exceeds && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-300"
          >
            <AlertTriangle size={16} className="shrink-0" />
            <span className="text-xs font-medium">
              Excede capacidad de {tankCapacity}L
            </span>
          </motion.div>
        )}

        {!currentPrice && (
          <div className="text-center text-xs text-white/40">
            Cargando precio...
          </div>
        )}
      </div>
    </motion.div>
  )
}
