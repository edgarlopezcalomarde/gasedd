export type FuelTypeKey =
  | "Precio Gasolina 95 E5"
  | "Precio Gasolina 98 E5"
  | "Precio Gasoleo A"
  | "Precio Gasoleo Premium"
  | "Precio Gasolina 95 E10"
  | "Precio Gasolina 95 E25"
  | "Precio Gasolina 95 E85"
  | "Precio Gasolina 95 E5 Premium"
  | "Precio Gasolina 98 E10"
  | "Precio Gasolina Renovable"
  | "Precio Gasoleo B"
  | "Precio Diésel Renovable"
  | "Precio Gases licuados del petróleo"
  | "Precio Gas Natural Comprimido"
  | "Precio Gas Natural Licuado"
  | "Precio Biodiesel"
  | "Precio Bioetanol"
  | "Precio Adblue"
  | "Precio Hidrogeno"

export interface FuelType {
  id: string
  key: FuelTypeKey
  name: string
  shortName: string
  category: "gasoline" | "diesel" | "alternative"
}

export const FUEL_TYPES: FuelType[] = [
  {
    id: "1",
    key: "Precio Gasolina 95 E5",
    name: "Gasolina 95 E5",
    shortName: "95 E5",
    category: "gasoline",
  },
  {
    id: "2",
    key: "Precio Gasolina 95 E10",
    name: "Gasolina 95 E10",
    shortName: "95 E10",
    category: "gasoline",
  },
  {
    id: "3",
    key: "Precio Gasolina 95 E25",
    name: "Gasolina 95 E25",
    shortName: "95 E25",
    category: "gasoline",
  },
  {
    id: "4",
    key: "Precio Gasolina 95 E85",
    name: "Gasolina 95 E85",
    shortName: "95 E85",
    category: "gasoline",
  },
  {
    id: "5",
    key: "Precio Gasolina 95 E5 Premium",
    name: "Gasolina 95 E5 Premium",
    shortName: "95 E5 Premium",
    category: "gasoline",
  },
  {
    id: "6",
    key: "Precio Gasolina 98 E5",
    name: "Gasolina 98 E5",
    shortName: "98 E5",
    category: "gasoline",
  },
  {
    id: "7",
    key: "Precio Gasolina 98 E10",
    name: "Gasolina 98 E10",
    shortName: "98 E10",
    category: "gasoline",
  },
  {
    id: "8",
    key: "Precio Gasolina Renovable",
    name: "Gasolina Renovable",
    shortName: "Renovable",
    category: "gasoline",
  },
  {
    id: "9",
    key: "Precio Gasoleo A",
    name: "Gasóleo A",
    shortName: "Diésel",
    category: "diesel",
  },
  {
    id: "10",
    key: "Precio Gasoleo B",
    name: "Gasóleo B",
    shortName: "Diiesel B",
    category: "diesel",
  },
  {
    id: "11",
    key: "Precio Gasoleo Premium",
    name: "Gasóleo Premium",
    shortName: "Diiesel Premium",
    category: "diesel",
  },
  {
    id: "12",
    key: "Precio Diésel Renovable",
    name: "Diésel Renovable",
    shortName: "Diiesel Renovable",
    category: "diesel",
  },
  {
    id: "13",
    key: "Precio Gases licuados del petróleo",
    name: "GLP",
    shortName: "GLP",
    category: "alternative",
  },
  {
    id: "14",
    key: "Precio Gas Natural Comprimido",
    name: "GNC",
    shortName: "GNC",
    category: "alternative",
  },
  {
    id: "15",
    key: "Precio Gas Natural Licuado",
    name: "GNL",
    shortName: "GNL",
    category: "alternative",
  },
  {
    id: "16",
    key: "Precio Biodiesel",
    name: "Biodiesel",
    shortName: "Biodiesel",
    category: "alternative",
  },
  {
    id: "17",
    key: "Precio Bioetanol",
    name: "Bioetanol",
    shortName: "Bioetanol",
    category: "alternative",
  },
  {
    id: "18",
    key: "Precio Adblue",
    name: "AdBlue",
    shortName: "AdBlue",
    category: "alternative",
  },
  {
    id: "19",
    key: "Precio Hidrogeno",
    name: "Hidrógeno",
    shortName: "H2",
    category: "alternative",
  },
]

export const DEFAULT_FUEL_KEY: FuelTypeKey = "Precio Gasolina 95 E5"

export const getFuelPrice = (
  station: Record<string, string | undefined>,
  fuelKey: FuelTypeKey
): number | null => {
  const price = station[fuelKey]
  if (!price) return null
  const parsed = parseFloat(price.replace(",", "."))
  return isNaN(parsed) ? null : parsed
}

export const getFuelTypeById = (id: string): FuelType | undefined => {
  return FUEL_TYPES.find((fuel) => fuel.id === id)
}

export const getFuelTypeByKey = (key: string): FuelType | undefined => {
  return FUEL_TYPES.find((fuel) => fuel.key === key)
}
