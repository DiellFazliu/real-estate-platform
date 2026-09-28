import type { ReactNode } from 'react'

import { PropertyContent } from '@/components/properties/PropertyContent'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import { PropertyHeader } from '@/components/properties/PropertyHeader'
import { PropertySidebar } from '@/components/properties/PropertySidebar'
import type { PropertyPageData } from '@/components/properties/types'

interface PropertyDetailLayoutProps
  extends Pick<
    PropertyPageData,
    'property' | 'displayImages' | 'intelligence' | 'comparables' | 'isFavorite' | 'session'
  > {
  isAgent?: boolean
  beforeGallery?: ReactNode
}

export function PropertyDetailLayout({
  property,
  displayImages,
  intelligence,
  comparables,
  isFavorite,
  session,
  isAgent = false,
  beforeGallery,
}: PropertyDetailLayoutProps) {
  return (
    <PropertyHeader property={property}>
      {beforeGallery}
      <PropertyGallery property={property} displayImages={displayImages} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <PropertyContent
          property={property}
          intelligence={intelligence}
          comparables={comparables}
        />
        <PropertySidebar
          property={property}
          isFavorite={isFavorite}
          session={session}
          isAgent={isAgent}
        />
      </div>
    </PropertyHeader>
  )
}
