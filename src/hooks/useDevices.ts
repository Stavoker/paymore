import { useEffect, useState } from 'react'
import { Device, getDevicesByCategory, getDeviceVariants } from '../services/deviceService'
import { getDeviceVariantPrice, getVariantPrice } from '../services/priceListService';
import { DeviceVariant } from '../types/category';

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

export function useDeviceVariants(deviceId: number | null) {
  const [deviceVariants, setDeviceVariants] = useState<DeviceVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return

    try {
      setLoading(true)
      getDeviceVariants(deviceId).then((data) => {
        setDeviceVariants(data)
        setLoading(false)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false)
    }
  }, [deviceId])

  return { deviceVariants, loading, error }
}

export function useDeviceVariantPrice(categoryId: number | 0, deviceVariantId: number | 0, questionAnswersIds: number[]) {
  const [salePrice, setSalePrice] = useState<number | 0>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId === 0) return
    if (deviceVariantId === 0) return

    try {
      setLoading(true)
      getDeviceVariantPrice(categoryId, deviceVariantId, questionAnswersIds).then((data) => {
        setSalePrice(data)
        setLoading(false)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false)
    }
  }, [categoryId,deviceVariantId, questionAnswersIds])

  return { salePrice, loading, error }
}