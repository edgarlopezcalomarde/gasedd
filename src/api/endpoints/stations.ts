import { apiClient } from "../client"
import {
  PreciosEESSTerrestresSchema,
  StationHistorySchema,
  type EESSPrecio,
} from "../types"

export const getStations = async (): Promise<EESSPrecio[]> => {
  const response = await apiClient.get("/EstacionesTerrestres/")
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByProduct = async (
  productId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroProducto/${productId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByProvince = async (
  provinceId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroProvincia/${provinceId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByCCAA = async (
  ccaaId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroCCAA/${ccaaId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByMunicipality = async (
  municipalityId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroMunicipio/${municipalityId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByProvinceAndProduct = async (
  provinceId: string,
  productId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsByCCAAAndProduct = async (
  ccaaId: string,
  productId: string
): Promise<EESSPrecio[]> => {
  const response = await apiClient.get(
    `/EstacionesTerrestres/FiltroCCAAProducto/${ccaaId}/${productId}`
  )
  const parsed = PreciosEESSTerrestresSchema.parse(response.data)
  return parsed.ListaEESSPrecio
}

export const getStationsHistory = async (date: string) => {
  const response = await apiClient.get(`/EstacionesTerrestresHist/${date}`)
  return StationHistorySchema.parse(response.data)
}

export const getStationsHistoryByProvince = async (
  date: string,
  provinceId: string
) => {
  const response = await apiClient.get(
    `/EstacionesTerrestresHist/FiltroProvincia/${date}/${provinceId}`
  )
  return StationHistorySchema.parse(response.data)
}

export const getStationsHistoryByProduct = async (
  date: string,
  productId: string
) => {
  const response = await apiClient.get(
    `/EstacionesTerrestresHist/FiltroProducto/${date}/${productId}`
  )
  return StationHistorySchema.parse(response.data)
}

export const getStationsHistoryByProvinceAndProduct = async (
  date: string,
  provinceId: string,
  productId: string
) => {
  const response = await apiClient.get(
    `/EstacionesTerrestresHist/FiltroProvinciaProducto/${date}/${provinceId}/${productId}`
  )
  return StationHistorySchema.parse(response.data)
}
