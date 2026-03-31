import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useFilterStore } from "@/stores/filterStore"
import { useStationsByProvinces } from "@/hooks/useStationsByProvince"
import {
  getFuelPrice,
  DEFAULT_FUEL_KEY,
  type FuelTypeKey,
} from "@/lib/fuel-types"
import { Calculator, Fuel, ArrowLeftRight, AlertTriangle } from "lucide-react"
import { useState, useMemo } from "react"

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

export function FuelCalculator({ className }: FuelCalculatorProps) {
  const [mode, setMode] = useState<Mode>("euros")
  const [inputValue, setInputValue] = useState("")
  const { selectedFuel, tankCapacity } = useFilterStore()

  const stationsQuery = useStationsByProvinces(ALL_PROVINCE_IDS)
  const fuelKey: FuelTypeKey = (selectedFuel as FuelTypeKey) || DEFAULT_FUEL_KEY

  const currentPrice = useMemo(() => {
    if (!stationsQuery.data || stationsQuery.data.length === 0) return null

    const prices = stationsQuery.data
      .map((s) =>
        getFuelPrice(
          s as unknown as Record<string, string | undefined>,
          fuelKey
        )
      )
      .filter((p): p is number => p !== null)

    if (prices.length === 0) return null

    prices.sort((a, b) => a - b)
    return prices[Math.floor(prices.length * 0.1)]
  }, [stationsQuery.data, fuelKey])

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

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={handleModeSwitch}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeftRight size={14} />
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

        <div className="mb-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
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
          <div className="mb-2 text-center text-xs text-white/40">
            Precio medio: {currentPrice.toFixed(3)} €/L
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
            Cargando precio medio...
          </div>
        )}
      </div>
    </motion.div>
  )
}
