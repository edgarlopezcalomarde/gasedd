import axios from "axios"

const API_BASE_URL =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message)
    return Promise.reject(error)
  }
)

export default apiClient
