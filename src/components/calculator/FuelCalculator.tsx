import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useFilterStore } from "@/stores/filterStore"
import { useSettingsStore } from "@/stores"
import { useMapStore } from "@/stores"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
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
        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
      >
        <div className="flex flex-col items-start">
          <span className="text-white/50">Gasolinera</span>
          <span className="truncate">
            {selectedStation?.Rótulo || "Seleccionar"}
          </span>
        </div>
        {selectedPrice !== null && (
          <span className="text-sm font-medium text-green-400">
            {selectedPrice.toFixed(3)}€
          </span>
        )}
        <ChevronDown size={16} className="text-white/50" />
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
        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
      >
        <div className="flex flex-col items-start">
          <span className="text-white/50">Combustible</span>
          <span>{selectedType?.name || "Seleccionar"}</span>
        </div>
        <ChevronDown size={16} className="text-white/50" />
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

  const { selectedFuel, setSelectedFuel, tankCapacity } = useFilterStore()
  const { setDefaultFuel } = useSettingsStore()
  const { viewStats } = useMapStore()

  const stationsQuery = useStationsByProvinces(ALL_PROVINCE_IDS)
  const selectedFuelType = selectedFuel ? getFuelTypeById(selectedFuel) : null
  const fuelKey: FuelTypeKey = selectedFuelType?.key || DEFAULT_FUEL_KEY

  const cheapestInView = useMemo(() => {
    if (!stationsQuery.data || stationsQuery.data.length === 0) return null

    const sorted = [...stationsQuery.data].sort((a, b) => {
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
  }, [stationsQuery.data, fuelKey])

  useMemo(() => {
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
      <div className="mb-4 flex items-center gap-2">
        <Calculator size={18} className="text-white/50" />
        <h3 className="text-lg font-semibold text-white">Calculadora</h3>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <StationSelector
          stations={stationsQuery.data || []}
          selectedStation={selectedStation}
          onSelect={setSelectedStation}
          fuelKey={fuelKey}
        />

        <FuelTypeSelector
          selectedFuel={selectedFuel}
          onSelect={handleFuelSelect}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleModeSwitch}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div className="flex flex-1 flex-col">
            <label className="text-xs text-white/50">
              {mode === "euros"
                ? "Cantidad en euros (€)"
                : "Cantidad en litros (L)"}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={mode === "euros" ? "0.00" : "0"}
              className="mt-1 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <div className="flex items-center gap-2 text-white/50">
            <Fuel size={14} />
            <span className="text-sm">
              {mode === "euros" ? "Litros obtenidos" : "Total a pagar"}
            </span>
          </div>
          <span className="font-mono text-lg font-bold text-white">
            {mode === "euros"
              ? `${result.liters.toFixed(2)} L`
              : `${result.euros.toFixed(2)} €`}
          </span>
        </div>

        {currentPrice && (
          <div className="text-center text-xs text-white/40">
            Precio: {currentPrice.toFixed(3)} €/L
            {selectedStation && (
              <span className="ml-1 text-green-400">
                ({selectedStation.Rótulo})
              </span>
            )}
          </div>
        )}

        {result.exceeds && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-400"
          >
            <AlertTriangle size={14} />
            <span className="text-xs">
              Excede la capacidad de tu depósito ({tankCapacity}L)
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
