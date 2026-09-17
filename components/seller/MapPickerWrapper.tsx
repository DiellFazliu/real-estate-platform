'use client'

import { useEffect, useState, ComponentType } from 'react'

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void
  initialLat?: number
  initialLng?: number
}

export function MapPicker(props: MapPickerProps) {
  const [MapComponent, setMapComponent] = useState<ComponentType<MapPickerProps> | null>(null)

  useEffect(() => {
    // Importo vetëm në browser (jo gjatë SSR)
    let isMounted = true

    import('./MapPicker').then((mod) => {
      if (isMounted) {
        setMapComponent(() => mod.MapPicker)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (!MapComponent) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6B4C3B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Duke ngarkuar hartën...</p>
        </div>
      </div>
    )
  }

  return <MapComponent {...props} />
}