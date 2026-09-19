'use client'

import dynamic from 'next/dynamic'

interface PropertyMapWrapperProps {
  latitude: number
  longitude: number
  title: string
  location?: string
}

export const PropertyMapWrapper = dynamic<PropertyMapWrapperProps>(
  () => import('./PropertyMapDisplay').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-[#F3E9E0] rounded-2xl flex items-center justify-center border border-[#6B4C3B]/10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6B4C3B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B4C3B]/60">Duke ngarkuar hartën...</p>
        </div>
      </div>
    ),
  }
)