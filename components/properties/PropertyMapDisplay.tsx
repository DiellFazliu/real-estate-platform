'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix për Leaflet marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface PropertyMapDisplayProps {
  latitude: number
  longitude: number
  title: string
  location?: string
}

export default function PropertyMapDisplay({
  latitude,
  longitude,
  title,
  location,
}: PropertyMapDisplayProps) {
  const position: [number, number] = [latitude, longitude]

  return (
    <div className="h-[400px] rounded-2xl overflow-hidden border border-[#6B4C3B]/10">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-1">
              <p className="font-bold text-gray-900">{title}</p>
              {location && <p className="text-sm text-gray-600">{location}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}