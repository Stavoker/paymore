import { useEffect, useState } from 'react'
import { Device, getDevicesByCategory } from '../services/deviceService'

export function useDevices(name: string, categoryId: number | null) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return
    try {
      setLoading(true)
      getDevicesByCategory(name, categoryId).then((data) => {
        setDevices(data)
        setLoading(false)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false)
    }
  }, [categoryId, name])

  return { devices, loading, error }
}