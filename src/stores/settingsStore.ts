import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark" | "system"
export type MapStyle = "osm-bright" | "osm-dark" | "liberty" | "fiord-color"

interface SettingsState {
  theme: "light" | "dark" | "system"
  mapStyle: string
  defaultFuel: string
  tankCapacity: number
  showMaritime: boolean

  setTheme: (theme: "light" | "dark" | "system") => void
  setMapStyle: (mapStyle: string) => void
  setDefaultFuel: (defaultFuel: string) => void
  setTankCapacity: (tankCapacity: number) => void
  setShowMaritime: (showMaritime: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      mapStyle: "liberty",
      defaultFuel: "1",
      tankCapacity: 50,
      showMaritime: false,

      setTheme: (theme) => set({ theme }),
      setMapStyle: (mapStyle) => set({ mapStyle }),
      setDefaultFuel: (defaultFuel) => set({ defaultFuel }),
      setTankCapacity: (tankCapacity) => set({ tankCapacity }),
      setShowMaritime: (showMaritime) => set({ showMaritime }),
    }),
    {
      name: "gasEdd-settings",
    }
  )
)
