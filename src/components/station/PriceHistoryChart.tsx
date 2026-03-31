import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { History, TrendingUp, TrendingDown } from "lucide-react"
import { useMemo, useState, useEffect } from "react"

interface PriceHistory {
  date: string
  price: number
}

interface PriceHistoryChartProps {
  stationId?: string
  currentPrice?: number | null
  className?: string
}

export function PriceHistoryChart({
  stationId,
  currentPrice,
  className,
}: PriceHistoryChartProps) {
  const [data, setData] = useState<PriceHistory[]>([])

  useEffect(() => {
    const generateMockData = () => {
      const days = 30
      const result: PriceHistory[] = []
      const today = new Date()

      let basePrice = currentPrice || 1.45

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        const randomChange = (Math.random() - 0.5) * 0.08
        basePrice = Math.max(1.2, Math.min(1.7, basePrice + randomChange))

        result.push({
          date: date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          }),
          price: parseFloat(basePrice.toFixed(3)),
        })
      }

      if (currentPrice && result.length > 0) {
        result[result.length - 1].price = currentPrice
      }

      return result
    }

    setData(generateMockData())
  }, [stationId, currentPrice])

  const stats = useMemo(() => {
    if (data.length < 2) return null

    const prices = data.map((d) => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const latest = prices[prices.length - 1]
    const previous = prices[prices.length - 2]
    const change = latest - previous

    return { min, max, avg, change, latest }
  }, [data])

  if (!stats || data.length === 0) {
    return (
      <div className={cn("p-4 text-center text-white/40", className)}>
        No hay datos históricos disponibles
      </div>
    )
  }

  return (
    <motion.div
      className={cn("p-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <History size={18} className="text-white/50" />
        <h3 className="text-lg font-semibold text-white">
          Historial de precios
        </h3>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-green-400">
            <TrendingDown size={12} />
            <span className="text-xs">Mín</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.min.toFixed(3)}€
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="text-xs text-white/50">Media</div>
          <div className="text-sm font-bold text-white">
            {stats.avg.toFixed(3)}€
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-red-400">
            <TrendingUp size={12} />
            <span className="text-xs">Máx</span>
          </div>
          <div className="text-sm font-bold text-white">
            {stats.max.toFixed(3)}€
          </div>
        </div>
      </div>

      <div className="h-40 rounded-xl border border-white/10 bg-white/5 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 8, fill: "rgba(255,255,255,0.4)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              interval={6}
            />
            <YAxis
              domain={["dataMin - 0.05", "dataMax + 0.05"]}
              tick={{ fontSize: 8, fill: "rgba(255,255,255,0.4)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              itemStyle={{ color: "#fff" }}
              formatter={(value) => [
                `${Number(value).toFixed(3)} €/L`,
                "Precio",
              ]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center">
        <span
          className={cn(
            "text-xs",
            stats.change > 0 ? "text-red-400" : "text-green-400"
          )}
        >
          {stats.change > 0 ? "+" : ""}
          {stats.change.toFixed(3)}€ hoy
        </span>
      </div>
    </motion.div>
  )
}
