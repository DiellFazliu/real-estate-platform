import { notFound } from 'next/navigation'
import { AutoOpenChat } from '@/components/chat/AutoOpenChat'
import { PropertyDetailLayout } from '@/components/properties/PropertyDetailLayout'
import { getPropertyDetail } from '@/lib/data/properties/get-property-detail'

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

      <PropertyDetailLayout
        property={data.property}
        displayImages={data.displayImages}
        intelligence={data.intelligence}
        comparables={data.comparables}
        isFavorite={data.isFavorite}
        session={data.session}
      />
    </main>
  )
}