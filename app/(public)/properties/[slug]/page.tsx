import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { AutoOpenChat } from '@/components/chat/AutoOpenChat'
import { PropertyContent } from '../../../../components/properties/PropertyContent'
import { PropertyGallery } from '../../../../components/properties/PropertyGallery'
import { PropertyHeader } from '../../../../components/properties/PropertyHeader'
import { PropertySidebar } from '../../../../components/properties/PropertySidebar'
import { getPropertyDetail } from '@/lib/data/properties/get-property-detail'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await getPropertyDetail(slug)
  if (!data) notFound()

  const isUnavailable = data.property.status === 'UNAVAILABLE'

  if (isUnavailable) {
    return <UnavailableState title={data.property.title} />
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#000000]">
<AutoOpenChat
  propertyId={data.property.id}
  propertyTitle={data.property.title}
  isSold={data.property.status === 'SOLD'}
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

function UnavailableState({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[#F7F3EE] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9E0]">
          <Home className="h-7 w-7 text-[#6B4C3B]" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
          Prona
        </p>

        <h1 className="font-serif text-3xl text-[#171310] sm:text-4xl">
          Kjo pronë nuk është më e disponueshme
        </h1>

        <p className="mt-4 max-w-md text-sm leading-7 text-black/55">
          Listimi <span className="font-semibold text-black">"{title}"</span>{' '}
          është tërhequr nga platforma. Mund të shikoni prona të tjera të
          ngjashme.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Search className="h-4 w-4" />
            Shfleto pronat
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8DDD2] bg-white px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kthehu në Home
          </Link>
        </div>
      </div>
    </main>
  )
}