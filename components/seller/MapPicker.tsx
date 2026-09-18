'use client'

import dynamic from 'next/dynamic'

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void
  initialLat?: number
  initialLng?: number
}

// Fixed: Added .then((mod) => mod.default) to resolve default exports safely in Next.js dynamic routing
export const MapPicker = dynamic<MapPickerProps>(
  () => import('./MapPickerInner').then((mod) => mod.default),
  {
    ssr: false, // Prevents Leaflet execution on server entirely
    loading: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6B4C3B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Duke ngarkuar hartën...</p>
        </div>
      </div>
    ),
  }
)