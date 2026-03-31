import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FilterState {
  selectedFuel: string | null
  selectedProvince: string | null
  selectedCCAA: string | null
  selectedMunicipality: string | null
  tankCapacity: number

  setSelectedFuel: (fuel: string | null) => void
  setSelectedProvince: (province: string | null) => void
  setSelectedCCAA: (ccaa: string | null) => void
  setSelectedMunicipality: (municipality: string | null) => void
  setTankCapacity: (capacity: number) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      selectedFuel: null,
      selectedProvince: null,
      selectedCCAA: null,
      selectedMunicipality: null,
      tankCapacity: 50,

      setSelectedFuel: (selectedFuel) => set({ selectedFuel }),
      setSelectedProvince: (selectedProvince) => set({ selectedProvince }),
      setSelectedCCAA: (selectedCCAA) => set({ selectedCCAA }),
      setSelectedMunicipality: (selectedMunicipality) =>
        set({ selectedMunicipality }),
      setTankCapacity: (tankCapacity) => set({ tankCapacity }),
      resetFilters: () =>
        set({
          selectedFuel: null,
          selectedProvince: null,
          selectedCCAA: null,
          selectedMunicipality: null,
        }),
    }),
    {
      name: "gasEdd-filters",
    }
  )
)
