import { apiClient } from "../client"
import { ProductoPetroliferoSchema, type ProductoPetrolifero } from "../types"

export const getProducts = async (): Promise<ProductoPetrolifero[]> => {
  const response = await apiClient.get("/Listados/ProductosPetroliferos/")
  const data = response.data
  if (Array.isArray(data)) {
    return data.map((item: ProductoPetrolifero) =>
      ProductoPetroliferoSchema.parse(item)
    )
  }
  return []
}
