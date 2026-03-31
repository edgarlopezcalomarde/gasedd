import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark" | "system"
export type MapStyle = "osm-bright" | "osm-dark" | "liberty" | "fiord-color"

interface SettingsState {
  theme: Theme
  mapStyle: MapStyle
  defaultFuel: string
  tankCapacity: number
  autoCenterCheapest: boolean
  showMaritime: boolean

  setTheme: (theme: Theme) => void
  setMapStyle: (style: MapStyle) => void
  setDefaultFuel: (fuel: string) => void
  setTankCapacity: (capacity: number) => void
  setAutoCenterCheapest: (value: boolean) => void
  setShowMaritime: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      mapStyle: "liberty",
      defaultFuel: "1",
      tankCapacity: 50,
      autoCenterCheapest: true,
      showMaritime: false,

      setTheme: (theme) => set({ theme }),
      setMapStyle: (mapStyle) => set({ mapStyle }),
      setDefaultFuel: (defaultFuel) => set({ defaultFuel }),
      setTankCapacity: (tankCapacity) => set({ tankCapacity }),
      setAutoCenterCheapest: (autoCenterCheapest) =>
        set({ autoCenterCheapest }),
      setShowMaritime: (showMaritime) => set({ showMaritime }),
    }),
    {
      name: "gasEdd-settings",
    }
  )
)
