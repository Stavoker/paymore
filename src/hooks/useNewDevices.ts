import { useEffect, useState } from 'react'
import { Device, DeviceVariant, DeviceCharacteristic, getDevicesByCategory, getVariantsByDevice, getCharacteristicsByDevice  } from '../services/deviceService'


export function useVariants(deviceId: number | null) {
  const [variants, setVariants] = useState<DeviceVariant[]>([])
  const [characteristics, setCharacteristics] = useState<Record<number, DeviceCharacteristic[]>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!deviceId) return
    setLoading(true)

    getVariantsByDevice(deviceId).then(async (variantList) => {
      setVariants(variantList)
      // Fetch characteristics for each variant
      // const allChars: Record<number, DeviceCharacteristic[]> = {}
      // for (const v of variantList) {
      //   allChars[v.id] = await getCharacteristicsByDevice(v.id)
      // }
      // setCharacteristics(allChars)
      setLoading(false)
    })
  }, [deviceId])

  return { variants, characteristics, loading }
}

export function useDeviceCharacteristics(deviceId: number | null) {
  const [characteristics, setCharacteristics] = useState<DeviceCharacteristic[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!deviceId) return
    setLoading(true)
    getCharacteristicsByDevice(deviceId).then((data) => {
      setCharacteristics(data)
      setLoading(false)
    })
  }, [deviceId])

  return { characteristics, loading }
}

export function useDevices(subcategoryId: number | null) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subcategoryId) return
    setLoading(true)
    getDevicesByCategory(subcategoryId).then((data) => {
      setDevices(data)
      setLoading(false)
    })
  }, [subcategoryId])

  return { devices, loading }
}