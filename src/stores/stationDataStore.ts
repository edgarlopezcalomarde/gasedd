import { create } from "zustand"
import type { EESSPrecio } from "@/api"

interface StationDataState {
  stations: EESSPrecio[]
  isLoading: boolean
  lastUpdated: number | null
  loadedProvinces: string[]

  setStations: (stations: EESSPrecio[]) => void
  addStations: (newStations: EESSPrecio[]) => void
  setLoading: (loading: boolean) => void
  setLastUpdated: () => void
  addLoadedProvinces: (provinces: string[]) => void
  clearLoadedProvinces: () => void
}

export const useStationDataStore = create<StationDataState>()((set) => ({
  stations: [],
  isLoading: false,
  lastUpdated: null,
  loadedProvinces: [],

  setStations: (stations) => set({ stations }),
  addStations: (newStations) =>
    set((state) => {
      const existingIds = new Set(state.stations.map((s) => s.IDEESS))
      const uniqueNew = newStations.filter((s) => !existingIds.has(s.IDEESS))
      return { stations: [...state.stations, ...uniqueNew] }
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdated: () => set({ lastUpdated: Date.now() }),
  addLoadedProvinces: (provinces) =>
    set((state) => ({
      loadedProvinces: [...new Set([...state.loadedProvinces, ...provinces])],
    })),
  clearLoadedProvinces: () => set({ loadedProvinces: [], stations: [] }),
}))
