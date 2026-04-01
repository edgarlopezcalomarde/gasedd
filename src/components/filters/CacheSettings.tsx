import { useCacheSettingsStore } from "@/stores"
import { Trash2, Database, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CacheSettingsProps {
  className?: string
}

export function CacheSettings({ className }: CacheSettingsProps) {
  const {
    cacheEnabled,
    cacheDurationHours,
    lastCacheUpdate,
    setCacheEnabled,
    setCacheDurationHours,
    clearCache,
  } = useCacheSettingsStore()

  const handleClearCache = async () => {
    if (confirm("¿Estás seguro de que quieres borrar el caché?")) {
      await clearCache()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Database size={18} className="text-white/50" />
        <h4 className="text-sm font-medium text-white">Caché</h4>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Activar caché</span>
          <button
            onClick={() => setCacheEnabled(!cacheEnabled)}
            className="flex items-center justify-center transition-colors"
          >
            {cacheEnabled ? (
              <ToggleRight size={28} className="text-green-400" />
            ) : (
              <ToggleLeft size={28} className="text-white/40" />
            )}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Duración del cache:</span>
            <span className="text-sm font-medium text-white">
              {cacheDurationHours} horas
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            value={cacheDurationHours}
            onChange={(e) => setCacheDurationHours(parseInt(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-green-400"
            disabled={!cacheEnabled}
          />
          <div className="flex justify-between text-[10px] text-white/30">
            <span>1h</span>
            <span>12h</span>
            <span>24h</span>
          </div>
        </div>

        {lastCacheUpdate && (
          <p className="text-xs text-white/40">
            Última actualización:{" "}
            {new Date(lastCacheUpdate).toLocaleString("es-ES", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        )}

        <button
          onClick={handleClearCache}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 size={16} />
          <span>Borrar cache</span>
        </button>
      </div>
    </div>
  )
}
