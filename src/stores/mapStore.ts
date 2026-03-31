import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PriceStats } from "@/lib/price-utils"

export interface Viewport {
  lng: number
  lat: number
  zoom: number
  bearing?: number
  pitch?: number
}

export type Bounds = [[number, number], [number, number]]

interface MapState {
  viewport: Viewport
  bounds: Bounds | null
  selectedStationId: string | null
  isBlocked: boolean
  viewStats: PriceStats | null
  visibleProvinces: string[]
  userLocation: { lng: number; lat: number } | null
  showRoute: boolean
  routeToStationId: string | null
  showLocationPrompt: boolean

  setViewport: (viewport: Viewport) => void
  setBounds: (bounds: Bounds | null) => void
  setSelectedStation: (id: string | null) => void
  setBlocked: (blocked: boolean) => void
  setViewStats: (stats: PriceStats | null) => void
  setVisibleProvinces: (provinces: string[]) => void
  setUserLocation: (location: { lng: number; lat: number } | null) => void
  setShowRoute: (show: boolean) => void
  setRouteToStationId: (stationId: string | null) => void
  setShowLocationPrompt: (show: boolean) => void
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: {
        lng: -3.70379,
        lat: 40.416775,
        zoom: 6,
        bearing: 0,
        pitch: 0,
      },
      bounds: null,
      selectedStationId: null,
      isBlocked: false,
      viewStats: null,
      visibleProvinces: [],
      userLocation: null,
      showRoute: false,
      routeToStationId: null,
      showLocationPrompt: false,

      setViewport: (viewport) => set({ viewport }),
      setBounds: (bounds) => set({ bounds }),
      setSelectedStation: (selectedStationId) => set({ selectedStationId }),
      setBlocked: (isBlocked) => set({ isBlocked }),
      setViewStats: (viewStats) => set({ viewStats }),
      setVisibleProvinces: (visibleProvinces) => set({ visibleProvinces }),
      setUserLocation: (userLocation) => set({ userLocation }),
      setShowRoute: (showRoute) => set({ showRoute }),
      setRouteToStationId: (routeToStationId) => set({ routeToStationId }),
      setShowLocationPrompt: (showLocationPrompt) =>
        set({ showLocationPrompt }),
    }),
    {
      name: "gasedd-map-storage",
      partialize: (state) => ({
        userLocation: state.userLocation,
        viewport: state.viewport,
      }),
    }
  )
)
