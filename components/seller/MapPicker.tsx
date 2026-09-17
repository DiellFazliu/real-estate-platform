'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix për marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void
  initialLat?: number
  initialLng?: number
}

function LocationMarker({
  onLocationSelect,
  initialPosition,
}: {
  onLocationSelect: (coords: { lat: number; lng: number }) => void
  initialPosition: [number, number]
}) {
  const [position, setPosition] = useState<[number, number]>(initialPosition)

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return <Marker position={position} />
}

export function MapPicker({
  onLocationSelect,
  initialLat = 42.6629,
  initialLng = 21.1655,
}: MapPickerProps) {
  const initialPosition: [number, number] = [initialLat, initialLng]

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          initialPosition={initialPosition}
        />
      </MapContainer>
    </div>
  )
}