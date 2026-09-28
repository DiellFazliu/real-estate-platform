import { notFound } from 'next/navigation'
import { AutoOpenChat } from '@/components/chat/AutoOpenChat'
import { getPropertyDetail } from '@/lib/data/properties/get-property-detail'
import { PropertyContent } from '../../../../components/properties/PropertyContent'
import { PropertyGallery } from '../../../../components/properties/PropertyGallery'
import { PropertyHeader } from '../../../../components/properties/PropertyHeader'
import { PropertySidebar } from '../../../../components/properties/PropertySidebar'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await getPropertyDetail(slug)
  if (!data) notFound()

  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#000000]">
      <AutoOpenChat
        propertyId={data.property.id}
        propertyTitle={data.property.title}
      />

      <PropertyHeader property={data.property}>
        <PropertyGallery
          property={data.property}
          displayImages={data.displayImages}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PropertyContent
            property={data.property}
            intelligence={data.intelligence}
            comparables={data.comparables}
          />
          <PropertySidebar
            property={data.property}
            isFavorite={data.isFavorite}
            session={data.session}
          />
        </div>
      </PropertyHeader>
    </main>
  )
}