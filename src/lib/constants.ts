export const API_BASE_URL =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes"

export const MAP_STYLES: Record<string, string> = {
  "osm-bright": "https://tiles.openfreemap.org/styles/liberty",
  "osm-dark": "https://tiles.openfreemap.org/styles/osm-bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  "fiord-color": "https://tiles.openfreemap.org/styles/fiord-color",
}

export const SPAIN_CENTER = {
  lng: -3.70379,
  lat: 40.416775,
} as const

export const DEFAULT_ZOOM = 6 as const
export const MIN_ZOOM = 3 as const
export const MAX_ZOOM = 18 as const

export const PRICE_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444",
} as const

export type PriceColorKey = keyof typeof PRICE_COLORS

export const DEFAULT_TANK_CAPACITY = 50
