import { apiClient } from "../client"
import { PreciosPostesMaritimosSchema, type PosteMaritimo } from "../types"

export const getMaritimeStations = async (): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get("/PostesMaritimos/")
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}

export const getMaritimeStationsByProduct = async (
  productId: string
): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get(
    `/PostesMaritimos/FiltroProducto/${productId}`
  )
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}

export const getMaritimeStationsByProvince = async (
  provinceId: string
): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get(
    `/PostesMaritimos/FiltroProvincia/${provinceId}`
  )
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}

export const getMaritimeStationsByCCAA = async (
  ccaaId: string
): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get(`/PostesMaritimos/FiltroCCAA/${ccaaId}`)
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}

export const getMaritimeStationsByProvinceAndProduct = async (
  provinceId: string,
  productId: string
): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get(
    `/PostesMaritimos/FiltroProvinciaProducto/${provinceId}/${productId}`
  )
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}

export const getMaritimeStationsByCCAAAndProduct = async (
  ccaaId: string,
  productId: string
): Promise<PosteMaritimo[]> => {
  const response = await apiClient.get(
    `/PostesMaritimos/FiltroCCAAProducto/${ccaaId}/${productId}`
  )
  const parsed = PreciosPostesMaritimosSchema.parse(response.data)
  return parsed.ListaEEPPrecio
}
