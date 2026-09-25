'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { MapPin, TrendingUp } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface NearbyProperty {
  id: number
  slug: string
  title: string
  price: number
  price_per_m2: number | null
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  latitude: number
  longitude: number
  neighborhood: string | null
  city: string | null
  primary_image_url: string | null
  listing_type: string
  distance: number
}

interface EnhancedMapProps {
  latitude: number
  longitude: number
  title: string
  location: string
  propertyId: number
  price: number
  pricePerM2?: number | null
}

// ═══════════════════════════════════════════════════════════════
// ICON 1: CURRENT PROPERTY
// ═══════════════════════════════════════════════════════════════

const currentPropertyIcon = L.divIcon({
  className: 'current-property-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #DC2626;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      position: relative;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// ═══════════════════════════════════════════════════════════════
// ICON 2: NEARBY PROPERTIES
// ═══════════════════════════════════════════════════════════════

function formatPriceForMarker(price: number, isRent: boolean): string {
  if (price < 1000) {
    return `€${price}`
  }

  if (price < 1000000) {
    const k = price / 1000
    return k % 1 === 0 ? `€${k}k` : `€${k.toFixed(1)}k`
  }

  const m = price / 1000000
  return m % 1 === 0 ? `€${m}M` : `€${m.toFixed(1)}M`
}

function createPriceIcon(price: number, isRent: boolean): L.DivIcon {
  const formattedPrice = formatPriceForMarker(price, isRent)
  const bgColor = isRent ? '#3B82F6' : '#10B981'

  return L.divIcon({
    className: 'price-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 9px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        border: 1px solid white;
        white-space: nowrap;
        transition: all 0.2s;
        cursor: pointer;
        line-height: 1.3;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${formattedPrice}
      </div>
    `,
    iconSize: [40, 18],
    iconAnchor: [20, 18],
  })
}

// ═══════════════════════════════════════════════════════════════
// HEATMAP LAYER
// ═══════════════════════════════════════════════════════════════

function PriceHeatmapLayer({
  properties,
  enabled,
}: {
  properties: NearbyProperty[]
  enabled: boolean
}) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!map) return

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (!enabled || properties.length === 0) return

    const prices = properties
      .map((p) => p.price_per_m2)
      .filter((p): p is number => p !== null)

    if (prices.length === 0) return

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice || 1

    const heatPoints: [number, number, number][] = properties
      .filter((p) => p.price_per_m2 !== null)
      .map((p) => {
        const intensity = (p.price_per_m2! - minPrice) / range
        return [p.latitude, p.longitude, intensity] as [number, number, number]
      })

    // @ts-ignore
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.0: '#22c55e',
        0.3: '#84cc16',
        0.5: '#eab308',
        0.7: '#f97316',
        1.0: '#dc2626',
      },
    })

    heatLayer.addTo(map)
    heatLayerRef.current = heatLayer

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
    }
  }, [map, properties, enabled])

  return null
}

// ═══════════════════════════════════════════════════════════════
// 🎯 MAP CONTROLS — brenda MapContainer, mbi hartë por nën modal
// ═══════════════════════════════════════════════════════════════

function MapControls({
  showNearby,
  setShowNearby,
  showHeatmap,
  setShowHeatmap,
}: {
  showNearby: boolean
  setShowNearby: (v: boolean) => void
  showHeatmap: boolean
  setShowHeatmap: (v: boolean) => void
}) {
  const map = useMap()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!map) return

    // Krijo një div të ri brenda kontejnerit të Leaflet
    const container = L.DomUtil.create(
      'div',
      'leaflet-control map-custom-controls'
    ) as HTMLDivElement

    // Pozicionoje në këndin e sipërm djathtas
    container.style.position = 'absolute'
    container.style.top = '16px'
    container.style.right = '16px'
    container.style.zIndex = '500' // mbi Leaflet panes (400), nën modal (9999)
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '8px'
    container.style.pointerEvents = 'auto'

    // Vendose brenda kontejnerit të hartës
    map.getContainer().appendChild(container)
    containerRef.current = container

    return () => {
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current)
      }
    }
  }, [map])

  // Render butonat me React portal brenda kontenierit DOM
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    if (containerRef.current) setPortalReady(true)
  }, [])

  if (!portalReady || !containerRef.current) return null

  const { createPortal } = require('react-dom')

  return createPortal(
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowNearby(!showNearby)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition shadow-lg ${
          showNearby
            ? 'bg-[#6B4C3B] text-white'
            : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        <MapPin size={16} />
        {showNearby ? 'Fshih' : 'Shfaq'} pronat
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowHeatmap(!showHeatmap)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition shadow-lg ${
          showHeatmap
            ? 'bg-[#DC2626] text-white'
            : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        <TrendingUp size={16} />
        {showHeatmap ? 'Fshih' : 'Shfaq'} Trendin e çmimeve
      </button>
    </>,
    containerRef.current
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN MAP COMPONENT
// ═══════════════════════════════════════════════════════════════

export function EnhancedMap({
  latitude,
  longitude,
  title,
  location,
  propertyId,
  price,
  pricePerM2,
}: EnhancedMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [nearbyProperties, setNearbyProperties] = useState<NearbyProperty[]>([])
  const [showNearby, setShowNearby] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    async function fetchNearby() {
      try {
        const res = await fetch(
          `/api/properties/nearby?lat=${latitude}&lng=${longitude}&excludeId=${propertyId}&radius=5`
        )
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setNearbyProperties(data)
      } catch (error) {
        console.error('Nearby fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNearby()
  }, [latitude, longitude, propertyId])

  if (!isMounted) {
    return (
      <div className="h-96 bg-[#F3E9E0] rounded-xl flex items-center justify-center">
        <p className="text-black/40">Duke ngarkuar hartën...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Map — me butonat brenda */}
      <div className="h-96 min-h-96 rounded-xl overflow-hidden border border-[#6B4C3B]/10">
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '384px', width: '100%' }}
        >
          {/* Butonat brenda hartës, të menaxhuar nga Leaflet */}
          <MapControls
            showNearby={showNearby}
            setShowNearby={setShowNearby}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
          />

          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showHeatmap && nearbyProperties.length > 0 && (
            <PriceHeatmapLayer
              properties={nearbyProperties}
              enabled={showHeatmap}
            />
          )}

          <Marker
            position={[latitude, longitude]}
            icon={currentPropertyIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <p className="font-bold text-black text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-600 mb-2">{location}</p>
                <p className="text-lg font-bold text-[#6B4C3B]">
                  €{price.toLocaleString()}
                </p>
                {pricePerM2 && (
                  <p className="text-xs text-gray-500">
                    €{pricePerM2.toLocaleString()} / m²
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {showNearby &&
            nearbyProperties.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={createPriceIcon(p.price, p.listing_type === 'rent')}
              >
                <Popup>
                  <div className="p-2 min-w-[220px]">
                    {p.primary_image_url && (
                      <img
                        src={p.primary_image_url}
                        alt={p.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-bold text-black text-sm mb-1 line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      📍 {p.neighborhood}, {p.city}
                    </p>
                    <p className="text-lg font-bold text-[#6B4C3B]">
                      €{p.price.toLocaleString()}
                      {p.listing_type === 'rent' && (
                        <span className="text-xs text-gray-500">/muaj</span>
                      )}
                    </p>
                    {p.price_per_m2 && (
                      <p className="text-xs text-gray-500 mb-2">
                        €{p.price_per_m2.toLocaleString()} / m²
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      {p.area && <span>📐 {p.area}m²</span>}
                      {p.bedrooms && <span>🛏️ {p.bedrooms}</span>}
                      {p.bathrooms && <span>🚿 {p.bathrooms}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {p.distance}km larg
                    </p>
                    <a
                      href={`/properties/${p.slug}`}
                      className="block w-full text-center py-2 bg-[#6B4C3B] text-white text-xs font-medium rounded hover:bg-[#583e31] transition !text-white"
                    >
                      Shiko pronën →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* LEGEND */}
      <div className="h-20 mt-4">
        {showHeatmap ? (
          <div className="p-4 bg-white rounded-xl border border-[#6B4C3B]/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-black">
                Çmimet / m²
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded"
                  style={{ background: '#22c55e' }}
                />
                <span className="text-black/60">Të ulëta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded"
                  style={{ background: '#eab308' }}
                />
                <span className="text-black/60">Mesatare</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded"
                  style={{ background: '#dc2626' }}
                />
                <span className="text-black/60">Të larta</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-xl border border-[#6B4C3B]/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-black">
                Lloji i pronave
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: '#10B981' }}
                />
                <span className="text-black/60">Në Shitje</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: '#3B82F6' }}
                />
                <span className="text-black/60">Me Qira</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: '#DC2626' }}
                />
                <span className="text-black/60">Kjo pronë</span>
              </div>
            </div>
            {!loading && nearbyProperties.length > 0 && (
              <p className="text-xs text-black/40 mt-2">
                {nearbyProperties.length} prona të ngjashme brenda 5km
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}