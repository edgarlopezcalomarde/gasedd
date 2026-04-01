import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/lib/db"

interface CacheSettingsState {
  cacheEnabled: boolean
  cacheDurationHours: number
  lastCacheUpdate: number | null

  setCacheEnabled: (enabled: boolean) => void
  setCacheDurationHours: (hours: number) => void
  updateLastCacheUpdate: () => void
  clearCache: () => Promise<void>
}

export const useCacheSettingsStore = create<CacheSettingsState>()(
  persist(
    (set) => ({
      cacheEnabled: true,
      cacheDurationHours: 5,
      lastCacheUpdate: null,

      setCacheEnabled: (enabled) => set({ cacheEnabled: enabled }),
      setCacheDurationHours: (hours) => set({ cacheDurationHours: hours }),
      updateLastCacheUpdate: () => set({ lastCacheUpdate: Date.now() }),

      clearCache: async () => {
        await db.cache.clear()
        set({ lastCacheUpdate: null })
      },
    }),
    {
      name: "gasedd-cache-settings",
    }
  )
)
