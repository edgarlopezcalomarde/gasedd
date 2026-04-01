import { create } from "zustand"
import type { EESSPrecio } from "@/api"

interface StationDataState {
  stations: EESSPrecio[]
  isLoading: boolean
  lastUpdated: number | null

  setStations: (stations: EESSPrecio[]) => void
  setLoading: (loading: boolean) => void
  setLastUpdated: () => void
}

export const useStationDataStore = create<StationDataState>()((set) => ({
  stations: [],
  isLoading: false,
  lastUpdated: null,

  setStations: (stations) => set({ stations }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdated: () => set({ lastUpdated: Date.now() }),
}))
