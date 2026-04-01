import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useFilterStore } from "@/stores/filterStore"
import {
  useSettingsStore,
  useMapStore,
  useStationDataStore,
  useStationStore,
} from "@/stores"
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
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)

  const sortedStations = useMemo(() => {
    return [...stations]
      .filter((s) => {
        const p = getFuelPrice(
          s as unknown as Record<string, string | undefined>,
          fuelKey
        )
        return p !== null
      })
      .sort((a, b) => {
        const priceA = getFuelPrice(
          a as unknown as Record<string, string | undefined>,
          fuelKey
        )!
        const priceB = getFuelPrice(
          b as unknown as Record<string, string | undefined>,
          fuelKey
        )!
        return priceA - priceB
      })
  }, [stations, fuelKey])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const insideContainer = containerRef.current?.contains(target)
      const insidePortal = portalRef.current?.contains(target)
      if (!insideContainer && !insidePortal) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      setDropdownRect(containerRef.current.getBoundingClientRect())
    }
    setIsOpen((v) => !v)
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
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="text-xs uppercase tracking-wide text-white/50">
            Gasolinera
          </span>
          <span className="w-full truncate font-medium">
            {selectedStation?.Rótulo || "Seleccionar gasolinera"}
          </span>
        </div>
        {selectedPrice !== null && (
          <span className="shrink-0 whitespace-nowrap rounded-lg bg-green-500/15 px-2 py-1 text-xs font-bold text-green-400">
            {selectedPrice.toFixed(3)}€
          </span>
        )}
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-white/30 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed z-[500] overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
            style={{
              top: dropdownRect.bottom + 4,
              left: dropdownRect.left,
              width: dropdownRect.width,
              maxHeight: "240px",
            }}
          >
            <div className="overflow-y-auto p-1" style={{ maxHeight: "240px" }}>
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
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onSelect(station)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="w-full truncate">{station.Rótulo}</span>
                      <span className="text-[10px] text-white/40">
                        {station.Localidad}, {station.Provincia}
                      </span>
                    </div>
                    {price !== null && (
                      <span
                        className={cn(
                          "shrink-0 font-mono font-medium",
                          isCheapest ? "text-green-400" : "text-white/50"
                        )}
                      >
                        {price.toFixed(3)}€
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
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
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)

  const selectedType = selectedFuel ? getFuelTypeById(selectedFuel) : null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const insideContainer = containerRef.current?.contains(target)
      const insidePortal = portalRef.current?.contains(target)
      if (!insideContainer && !insidePortal) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      setDropdownRect(containerRef.current.getBoundingClientRect())
    }
    setIsOpen((v) => !v)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/10"
      >
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="text-xs uppercase tracking-wide text-white/50">
            Combustible
          </span>
          <span className="font-medium">
            {selectedType?.name || "Seleccionar combustible"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-white/30 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed z-[500] overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
            style={{
              top: dropdownRect.bottom + 4,
              left: dropdownRect.left,
              width: dropdownRect.width,
              maxHeight: "240px",
            }}
          >
            <div className="overflow-y-auto p-1" style={{ maxHeight: "240px" }}>
              {FUEL_TYPES.map((fuel) => {
                const isSelected = selectedFuel === fuel.id
                return (
                  <button
                    key={fuel.id}
                    onMouseDown={(e) => {
                      e.preventDefault()
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
                    {isSelected && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
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
  const { cheapestStationId } = useStationStore()
  const { selectedFuel, setSelectedFuel, tankCapacity } = useFilterStore()
  const { setDefaultFuel } = useSettingsStore()
  const { viewStats, bounds } = useMapStore()

  const stationsInView = useMemo(() => {
    if (!stations.length || !bounds) return stations
    const [[minLng, minLat], [maxLng, maxLat]] = bounds
    return stations.filter((s) => {
      const lng = parseFloat(s["Longitud (WGS84)"]?.replace(",", ".") || "0")
      const lat = parseFloat(s.Latitud?.replace(",", ".") || "0")
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    })
  }, [stations, bounds])

  const selectedFuelType = selectedFuel ? getFuelTypeById(selectedFuel) : null
  const fuelKey: FuelTypeKey = selectedFuelType?.key || DEFAULT_FUEL_KEY

  // Use cheapest from the current viewport (computed in StationMarkersLayer)
  const cheapestInView = useMemo(() => {
    if (!cheapestStationId || !stations.length) return null
    return stations.find((s) => s.IDEESS === cheapestStationId) ?? null
  }, [cheapestStationId, stations])

  // Auto-select cheapest in view if nothing is selected yet
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
    return viewStats?.mean ?? null
  }, [selectedStation, viewStats?.mean, fuelKey])

  const parsedValue = parseFloat(inputValue.replace(",", ".")) || 0

  const result = useMemo(() => {
    if (!currentPrice || parsedValue <= 0) {
      return { liters: 0, euros: 0, exceeds: false }
    }
    if (mode === "euros") {
      const liters = parsedValue / currentPrice
      return { liters, euros: parsedValue, exceeds: liters > tankCapacity }
    } else {
      const euros = parsedValue * currentPrice
      return { liters: parsedValue, euros, exceeds: parsedValue > tankCapacity }
    }
  }, [mode, parsedValue, currentPrice, tankCapacity])

  const handleModeSwitch = () => {
    setMode(mode === "euros" ? "liters" : "euros")
    setInputValue("")
  }

  const handleFuelSelect = (fuel: FuelType) => {
    setSelectedFuel(fuel.id)
    setDefaultFuel(fuel.id)
    setSelectedStation(null) // reset so cheapest auto-selects for new fuel
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
          <h3 className="text-lg font-bold text-white">Calculadora</h3>
          <p className="text-xs text-white/40">Calcula coste o cantidad</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 shadow-lg">
        <StationSelector
          stations={stationsInView}
          selectedStation={selectedStation}
          onSelect={setSelectedStation}
          fuelKey={fuelKey}
        />

        <FuelTypeSelector
          selectedFuel={selectedFuel}
          onSelect={handleFuelSelect}
        />

        {/* Input */}
        <div className="flex items-end gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={handleModeSwitch}
            className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-yellow-500/10 text-yellow-400 transition-colors hover:border-yellow-400/50 hover:bg-yellow-500/20"
            title="Cambiar modo"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
            <label className="text-xs font-medium uppercase tracking-wide text-yellow-400/80">
              {mode === "euros" ? "Euros (€)" : "Litros (L)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value
                if (val === "" || /^\d*[.,]?\d*$/.test(val)) {
                  setInputValue(val)
                }
              }}
              placeholder="0"
              className="w-full min-w-0 bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Result */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-white/60">
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

        {/* Price info */}
        {currentPrice ? (
          <div className="rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-white/50">
            <span className="font-mono font-medium text-white">
              {currentPrice.toFixed(3)} €/L
            </span>
            {selectedStation && (
              <span className="ml-2 text-white/30">
                · {selectedStation.Localidad}
              </span>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-white/30">
            Cargando precio...
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
              Excede capacidad del depósito ({tankCapacity}L)
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
