import { apiClient } from "../client"
import {
  ProvinciaSchema,
  ComunidadAutonomaSchema,
  MunicipioSchema,
  type Provincia,
  type ComunidadAutonoma,
  type Municipio,
} from "../types"

export const getProvinces = async (): Promise<Provincia[]> => {
  const response = await apiClient.get("/Listados/Provincias/")
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: Provincia) => ProvinciaSchema.parse(item))
  }
  return []
}

export const getCCAA = async (): Promise<ComunidadAutonoma[]> => {
  const response = await apiClient.get("/Listados/ComunidadesAutonomas/")
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: ComunidadAutonoma) =>
      ComunidadAutonomaSchema.parse(item)
    )
  }
  return []
}

export const getMunicipalities = async (): Promise<Municipio[]> => {
  const response = await apiClient.get("/Listados/Municipios/")
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: Municipio) => MunicipioSchema.parse(item))
  }
  return []
}

export const getMunicipalitiesByProvince = async (
  provinceId: string
): Promise<Municipio[]> => {
  const response = await apiClient.get(
    `/Listados/MunicipiosPorProvincia/${provinceId}`
  )
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: Municipio) => MunicipioSchema.parse(item))
  }
  return []
}

export const getProvincesByCCAA = async (
  ccaaId: string
): Promise<Provincia[]> => {
  const response = await apiClient.get(
    `/Listados/ProvinciasPorComunidad/${ccaaId}`
  )
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: Provincia) => ProvinciaSchema.parse(item))
  }
  return []
}
