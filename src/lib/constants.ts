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

interface ProvinceBounds {
  lngMin: number
  lngMax: number
  latMin: number
  latMax: number
}

export const PROVINCE_BOUNDS: Record<string, ProvinceBounds> = {
  "01": { lngMin: -2.6, lngMax: -1.4, latMin: 42.5, latMax: 43.5 }, // Araba/Álava
  "02": { lngMin: -2.5, lngMax: -1.5, latMin: 40.8, latMax: 41.5 }, // Albacete
  "03": { lngMin: -1.0, lngMax: 0.5, latMin: 38.0, latMax: 39.0 }, // Alicante
  "04": { lngMin: -2.5, lngMax: -1.5, latMin: 36.8, latMax: 37.5 }, // Almería
  "05": { lngMin: -5.0, lngMax: -4.0, latMin: 40.5, latMax: 41.5 }, // Asturias
  "06": { lngMin: -7.0, lngMax: -5.5, latMin: 38.0, latMax: 39.0 }, // Badajoz
  "07": { lngMin: 2.0, lngMax: 4.0, latMin: 39.0, latMax: 40.5 }, // Illes Balears
  "08": { lngMin: 1.0, lngMax: 3.0, latMin: 40.5, latMax: 42.0 }, // Barcelona
  "09": { lngMin: -4.5, lngMax: -3.0, latMin: 41.5, latMax: 42.5 }, // Burgos
  "10": { lngMin: -7.5, lngMax: -6.5, latMin: 39.0, latMax: 40.0 }, // Cáceres
  "11": { lngMin: -6.5, lngMax: -5.5, latMin: 36.5, latMax: 37.5 }, // Cádiz
  "12": { lngMin: -1.0, lngMax: 0.0, latMin: 39.5, latMax: 40.5 }, // Castellón
  "13": { lngMin: -3.0, lngMax: -2.0, latMin: 38.5, latMax: 39.5 }, // Ciudad Real
  "14": { lngMin: -5.5, lngMax: -4.5, latMin: 37.5, latMax: 38.5 }, // Córdoba
  "15": { lngMin: -9.5, lngMax: -7.5, latMin: 42.5, latMax: 44.0 }, // A Coruña
  "16": { lngMin: -4.0, lngMax: -3.0, latMin: 39.5, latMax: 40.5 }, // Cuenca
  "17": { lngMin: 0.0, lngMax: 1.5, latMin: 41.5, latMax: 42.5 }, // Girona
  "18": { lngMin: -4.5, lngMax: -2.5, latMin: 36.5, latMax: 38.0 }, // Granada
  "19": { lngMin: -3.5, lngMax: -2.5, latMin: 40.5, latMax: 41.5 }, // Guadalajara
  "20": { lngMin: -2.5, lngMax: -1.5, latMin: 42.5, latMax: 43.5 }, // Gipuzkoa
  "21": { lngMin: -6.0, lngMax: -4.5, latMin: 37.0, latMax: 38.0 }, // Huelva
  "22": { lngMin: -1.0, lngMax: 0.5, latMin: 41.5, latMax: 42.5 }, // Huesca
  "23": { lngMin: -4.0, lngMax: -2.5, latMin: 37.5, latMax: 38.5 }, // Jaén
  "24": { lngMin: -5.5, lngMax: -4.0, latMin: 42.0, latMax: 43.0 }, // León
  "25": { lngMin: 0.0, lngMax: 1.5, latMin: 41.0, latMax: 42.5 }, // Lleida
  "26": { lngMin: -2.0, lngMax: -1.0, latMin: 42.0, latMax: 43.0 }, // La Rioja
  "27": { lngMin: -7.5, lngMax: -6.5, latMin: 42.5, latMax: 43.5 }, // Lugo
  "28": { lngMin: -4.5, lngMax: -3.0, latMin: 40.0, latMax: 41.0 }, // Madrid
  "29": { lngMin: -5.0, lngMax: -3.5, latMin: 36.5, latMax: 37.5 }, // Málaga
  "30": { lngMin: -1.5, lngMax: -0.5, latMin: 37.5, latMax: 38.5 }, // Murcia
  "31": { lngMin: -2.5, lngMax: -1.0, latMin: 42.0, latMax: 43.5 }, // Navarra
  "32": { lngMin: -8.0, lngMax: -6.5, latMin: 41.5, latMax: 43.0 }, // Ourense
  "33": { lngMin: -6.0, lngMax: -4.5, latMin: 43.0, latMax: 44.0 }, // Asturias (oviedo)
  "34": { lngMin: -5.0, lngMax: -4.0, latMin: 42.0, latMax: 43.0 }, // Palencia
  "35": { lngMin: -15.5, lngMax: -13.0, latMin: 27.5, latMax: 29.5 }, // Las Palmas
  "36": { lngMin: -8.5, lngMax: -7.0, latMin: 42.0, latMax: 43.0 }, // Pontevedra
  "37": { lngMin: -6.0, lngMax: -5.0, latMin: 40.5, latMax: 41.5 }, // Salamanca
  "38": { lngMin: -17.5, lngMax: -16.0, latMin: 27.5, latMax: 29.0 }, // Santa Cruz de Tenerife
  "39": { lngMin: -4.5, lngMax: -3.5, latMin: 43.0, latMax: 44.0 }, // Cantabria
  "40": { lngMin: -4.5, lngMax: -3.5, latMin: 40.5, latMax: 41.5 }, // Segovia
  "41": { lngMin: -6.0, lngMax: -4.5, latMin: 37.0, latMax: 38.0 }, // Sevilla
  "42": { lngMin: -4.0, lngMax: -3.0, latMin: 41.0, latMax: 42.0 }, // Soria
  "43": { lngMin: 0.5, lngMax: 2.0, latMin: 40.5, latMax: 41.5 }, // Tarragona
  "44": { lngMin: -1.5, lngMax: 0.0, latMin: 40.5, latMax: 42.0 }, // Teruel
  "45": { lngMin: -4.5, lngMax: -3.0, latMin: 39.5, latMax: 40.5 }, // Toledo
  "46": { lngMin: -1.5, lngMax: 0.0, latMin: 38.5, latMax: 40.0 }, // Valencia
  "47": { lngMin: -5.5, lngMax: -4.0, latMin: 41.0, latMax: 42.0 }, // Valladolid
  "48": { lngMin: -3.5, lngMax: -2.5, latMin: 43.0, latMax: 44.0 }, // Bizkaia
  "49": { lngMin: -6.0, lngMax: -5.0, latMin: 41.5, latMax: 42.5 }, // Zamora
  "50": { lngMin: -1.5, lngMax: 0.0, latMin: 41.5, latMax: 42.5 }, // Zaragoza
  "51": { lngMin: -2.0, lngMax: -1.0, latMin: 42.5, latMax: 43.5 }, // Ceuta
  "52": { lngMin: -5.5, lngMax: -5.0, latMin: 35.5, latMax: 36.5 }, // Melilla
}

export function findProvinceByCoords(lat: number, lng: number): string | null {
  for (const [id, bounds] of Object.entries(PROVINCE_BOUNDS)) {
    if (
      lng >= bounds.lngMin &&
      lng <= bounds.lngMax &&
      lat >= bounds.latMin &&
      lat <= bounds.latMax
    ) {
      return id
    }
  }
  return null
}
