import { useVariants, useDeviceCharacteristics } from '../hooks/useNewDevices'

export function DeviceDetail({ deviceId }: { deviceId: number }) {
  const { variants, loading: loadingVariants } = useVariants(deviceId)
  const { characteristics, loading: loadingChars } = useDeviceCharacteristics(deviceId)

  if (loadingVariants || loadingChars) return <p>Loading device details...</p>

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-xl font-semibold mb-2">Device Characteristics</h3>
      {characteristics.length > 0 ? (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {characteristics.map((c) => (
            <li key={c.id} className="flex justify-between border-b py-1">
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-700">{c.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No characteristics found.</p>
      )}

      <h3 className="text-xl font-semibold mt-6 mb-2">Available Variants</h3>
      {variants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <p className="font-medium">{variant.storage}</p>
              {variant.color && <p className="text-sm text-gray-600">{variant.color}</p>}
              {/*<p className="text-blue-600 font-bold mt-2">${variant.price}</p>*/}
            </div>
          ))}
        </div>
      ) : (
        <p>No variants found.</p>
      )}
    </div>
  )
}
