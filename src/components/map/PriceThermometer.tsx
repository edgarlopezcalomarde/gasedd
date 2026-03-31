import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useMapStore } from "@/stores"
import { PRICE_COLORS } from "@/lib/constants"

export function PriceThermometer({ className }: { className?: string }) {
  const { viewStats } = useMapStore()

  if (!viewStats || viewStats.count === 0) return null

  const { min, max, mean } = viewStats
  const range = max - min
  const normalizedMean = range > 0 ? (mean - min) / range : 0.5

  return (
    <motion.div
      className={cn(
        "absolute top-4 left-4 z-10 w-16 rounded-xl border border-white/10 bg-black/65 p-3 backdrop-blur-2xl",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.5 }}
    >
      <div className="mb-2 text-center">
        <div className="text-[10px] tracking-wider text-white/40 uppercase">
          precio
        </div>
        <div className="text-lg font-bold text-white tabular-nums">
          {mean.toFixed(3)}€
        </div>
      </div>

      <div className="relative h-24 w-full rounded-full bg-white/10">
        <div
          className="absolute bottom-0 h-full rounded-full transition-all duration-500"
          style={{
            width: "100%",
            background: `linear-gradient(to top, ${PRICE_COLORS.low}, ${PRICE_COLORS.medium}, ${PRICE_COLORS.high})`,
          }}
        />
        <motion.div
          className="absolute h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${normalizedMean * 100}%`,
            bottom: "50%",
          }}
          initial={{ bottom: "0%" }}
          animate={{ bottom: `${normalizedMean * 100}%` }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-white/40">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </motion.div>
  )
}
