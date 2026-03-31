import type { EESSPrecio } from "@/api/types"
import { getFuelPrice, type FuelTypeKey } from "./fuel-types"

export interface PriceStats {
  min: number
  max: number
  mean: number
  median: number
  p33: number
  p66: number
  count: number
}

export const calculatePriceStats = (
  stations: EESSPrecio[],
  fuelKey: FuelTypeKey
): PriceStats | null => {
  const prices = stations
    .map((station) => getFuelPrice(station, fuelKey))
    .filter((price): price is number => price !== null)
    .sort((a, b) => a - b)

  if (prices.length === 0) return null

  const min = prices[0]
  const max = prices[prices.length - 1]
  const sum = prices.reduce((acc, p) => acc + p, 0)
  const mean = sum / prices.length
  const median =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)]

  const p33Index = Math.floor(prices.length * 0.33)
  const p66Index = Math.floor(prices.length * 0.66)
  const p33 = prices[p33Index]
  const p66 = prices[p66Index]

  return { min, max, mean, median, p33, p66, count: prices.length }
}

export const getPriceColor = (
  price: number | null,
  stats: PriceStats | null
): "low" | "medium" | "high" => {
  if (price === null || stats === null) return "medium"
  if (price <= stats.p33) return "low"
  if (price <= stats.p66) return "medium"
  return "high"
}

export const findCheapestStation = (
  stations: EESSPrecio[],
  fuelKey: FuelTypeKey
): EESSPrecio | null => {
  let cheapest: EESSPrecio | null = null
  let lowestPrice = Infinity

  for (const station of stations) {
    const price = getFuelPrice(station, fuelKey)
    if (price !== null && price < lowestPrice) {
      lowestPrice = price
      cheapest = station
    }
  }

  return cheapest
}

export const findExpensiveStation = (
  stations: EESSPrecio[],
  fuelKey: FuelTypeKey
): EESSPrecio | null => {
  let expensive: EESSPrecio | null = null
  let highestPrice = -1

  for (const station of stations) {
    const price = getFuelPrice(station, fuelKey)
    if (price !== null && price > highestPrice) {
      highestPrice = price
      expensive = station
    }
  }

  return expensive
}

export const eurosToLiters = (euros: number, pricePerLiter: number): number => {
  if (pricePerLiter <= 0) return 0
  return euros / pricePerLiter
}

export const litersToEuros = (
  liters: number,
  pricePerLiter: number
): number => {
  return liters * pricePerLiter
}

export const formatPrice = (price: number): string => {
  return price.toFixed(3)
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export const stationToGeoJSON = (
  stations: EESSPrecio[]
): GeoJSON.FeatureCollection<GeoJSON.Point, EESSPrecio> => {
  return {
    type: "FeatureCollection",
    features: stations
      .filter((station) => station.Latitud && station["Longitud (WGS84)"])
      .map((station) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [
            parseFloat(station["Longitud (WGS84)"].replace(",", ".")),
            parseFloat(station.Latitud.replace(",", ".")),
          ],
        },
        properties: station,
      })),
  }
}

export { getFuelPrice } from "./fuel-types"
export type { FuelTypeKey } from "./fuel-types"
