import { useState, useEffect, useCallback } from "react"

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
  permission: "granted" | "denied" | "prompt" | "unknown"
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: "unknown",
  })

  const checkPermission = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({
        ...prev,
        permission: "denied",
        error: "Geolocation not supported",
      }))
      return
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      })
      setState((prev) => ({
        ...prev,
        permission: permissionStatus.state as "granted" | "denied" | "prompt",
      }))

      permissionStatus.onchange = () => {
        setState((prev) => ({
          ...prev,
          permission: permissionStatus.state as "granted" | "denied" | "prompt",
        }))
      }
    } catch {
      setState((prev) => ({
        ...prev,
        permission: "prompt",
      }))
    }
  }, [])

  const requestLocation = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation not supported"))
          return
        }

        setState((prev) => ({ ...prev, loading: true, error: null }))

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setState((prev) => ({
              ...prev,
              latitude,
              longitude,
              loading: false,
              permission: "granted",
            }))
            resolve({ latitude, longitude })
          },
          (error) => {
            let errorMessage = "Unknown error"
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied"
                setState((prev) => ({
                  ...prev,
                  loading: false,
                  permission: "denied",
                }))
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable"
                break
              case error.TIMEOUT:
                errorMessage = "Location request timed out"
                break
            }
            setState((prev) => ({
              ...prev,
              error: errorMessage,
              loading: false,
            }))
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        )
      }
    )
  }, [])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    ...state,
    requestLocation,
    checkPermission,
  }
}
