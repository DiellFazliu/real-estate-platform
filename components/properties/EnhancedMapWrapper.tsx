'use client'

import dynamic from 'next/dynamic'

const EnhancedMap = dynamic(
  () => import('./EnhancedMap').then((mod) => mod.EnhancedMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-[#F3E9E0] rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6B4C3B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-black/40">Duke ngarkuar hartën...</p>
        </div>
      </div>
    ),
  }
)

interface EnhancedMapWrapperProps {
  latitude: number
  longitude: number
  title: string
  location: string
  propertyId: number
  price: number
  pricePerM2?: number | null
}

export function EnhancedMapWrapper(props: EnhancedMapWrapperProps) {
  return <EnhancedMap {...props} />
}