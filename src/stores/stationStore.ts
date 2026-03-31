import { create } from "zustand"

interface StationState {
  hoveredStationId: string | null
  cheapestStationId: string | null
  expensiveStationId: string | null

  setHoveredStation: (id: string | null) => void
  setCheapestStation: (id: string | null) => void
  setExpensiveStation: (id: string | null) => void
}

export const useStationStore = create<StationState>()((set) => ({
  hoveredStationId: null,
  cheapestStationId: null,
  expensiveStationId: null,

  setHoveredStation: (hoveredStationId) => set({ hoveredStationId }),
  setCheapestStation: (cheapestStationId) => set({ cheapestStationId }),
  setExpensiveStation: (expensiveStationId) => set({ expensiveStationId }),
}))
