import { z } from "zod"

export const EESSPrecioSchema = z.object({
  IDEESS: z.string(),
  Latitud: z.string(),
  "Longitud (WGS84)": z.string(),
  Dirección: z.string(),
  Localidad: z.string(),
  Municipio: z.string(),
  Provincia: z.string(),
  IDProvincia: z.string(),
  IDMunicipio: z.string(),
  IDCCAA: z.string(),
  "C.P.": z.string(),
  Horario: z.string(),
  Rótulo: z.string(),
  Margen: z.string(),
  "Tipo Venta": z.string(),
  Remisión: z.string(),
  "Precio Gasolina 95 E5": z.string().optional(),
  "Precio Gasolina 95 E10": z.string().optional(),
  "Precio Gasolina 95 E25": z.string().optional(),
  "Precio Gasolina 95 E85": z.string().optional(),
  "Precio Gasolina 95 E5 Premium": z.string().optional(),
  "Precio Gasolina 98 E5": z.string().optional(),
  "Precio Gasolina 98 E10": z.string().optional(),
  "Precio Gasolina Renovable": z.string().optional(),
  "Precio Gasoleo A": z.string().optional(),
  "Precio Gasoleo B": z.string().optional(),
  "Precio Gasoleo Premium": z.string().optional(),
  "Precio Diésel Renovable": z.string().optional(),
  "Precio Gases licuados del petróleo": z.string().optional(),
  "Precio Gas Natural Comprimido": z.string().optional(),
  "Precio Gas Natural Licuado": z.string().optional(),
  "Precio Biodiesel": z.string().optional(),
  "Precio Bioetanol": z.string().optional(),
  "Precio Biogas Natural Comprimido": z.string().optional(),
  "Precio Biogas Natural Licuado": z.string().optional(),
  "Precio Adblue": z.string().optional(),
  "Precio Amoniaco": z.string().optional(),
  "Precio Metanol": z.string().optional(),
  "Precio Hidrogeno": z.string().optional(),
  "% BioEtanol": z.string().optional(),
  "% Éster metílico": z.string().optional(),
})

export type EESSPrecio = z.infer<typeof EESSPrecioSchema>

export const PreciosEESSTerrestresSchema = z.object({
  Fecha: z.string(),
  ListaEESSPrecio: z.array(EESSPrecioSchema),
  Nota: z.string().optional(),
  ResultadoConsulta: z.string(),
})

export type PreciosEESSTerrestres = z.infer<typeof PreciosEESSTerrestresSchema>

export const ProductoPetroliferoSchema = z.object({
  IDProducto: z.string(),
  NombreProducto: z.string(),
  NombreProductoAbreviatura: z.string(),
})

export type ProductoPetrolifero = z.infer<typeof ProductoPetroliferoSchema>

export const ProvinciaSchema = z.object({
  IDProvincia: z.string(),
  Provincia: z.string(),
})

export type Provincia = z.infer<typeof ProvinciaSchema>

export const ComunidadAutonomaSchema = z.object({
  IDCCAA: z.string(),
  CCAADescripcion: z.string(),
})

export type ComunidadAutonoma = z.infer<typeof ComunidadAutonomaSchema>

export const MunicipioSchema = z.object({
  IDMunicipio: z.string(),
  Municipio: z.string(),
  IDProvincia: z.string(),
})

export type Municipio = z.infer<typeof MunicipioSchema>

export const PosteMaritimoSchema = EESSPrecioSchema

export type PosteMaritimo = z.infer<typeof PosteMaritimoSchema>

export const PreciosPostesMaritimosSchema = z.object({
  Fecha: z.string(),
  ListaEEPPrecio: z.array(PosteMaritimoSchema),
  Nota: z.string().optional(),
  ResultadoConsulta: z.string(),
})

export type PreciosPostesMaritimos = z.infer<
  typeof PreciosPostesMaritimosSchema
>

export const HistoricalStationSchema = EESSPrecioSchema.extend({
  Fecha: z.string(),
})

export type HistoricalStation = z.infer<typeof HistoricalStationSchema>

export const StationHistorySchema = z.object({
  Fecha: z.string(),
  ListaEESSPrecio: z.array(HistoricalStationSchema),
  Nota: z.string().optional(),
  ResultadoConsulta: z.string(),
})

export type StationHistory = z.infer<typeof StationHistorySchema>
