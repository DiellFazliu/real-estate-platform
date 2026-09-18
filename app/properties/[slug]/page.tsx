import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { getPropertyBySlug } from '@/lib/db/queries'
import { serializeProperty } from '@/lib/utils/serialize'
import { SaveFavoriteButton } from '@/components/properties/SaveFavoriteButton'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Phone,
  CalendarDays,
  Heart,
  Check,
  Home,
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params

  // 1. Get property metadata from PostgreSQL
  const dbProperty = await getPropertyBySlug(slug)

  if (!dbProperty) notFound()

  // 2. Get content from Sanity
  let sanityContent: any = null

  try {
    sanityContent = await client.fetch(
      `*[_type == "property" && _id == $sanityId][0] {
        description,
        features,
        "images": images[] {
          asset-> {
            url
          }
        }
      }`,
      { sanityId: dbProperty.sanity_id }
    )
  } catch (error) {
    console.error('Sanity fetch error:', error)
  }

  // 3. Combine PostgreSQL + Sanity data
  const property = {
    ...serializeProperty(dbProperty),
    description: sanityContent?.description || null,
    features: sanityContent?.features || [],
    images: sanityContent?.images || [],
  }

  const isRent = property.listing_type === 'rent'

  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#000000]">
      {/* Back button */}
      <div className="border-b border-[#6B4C3B]/10 bg-[#F7F3EE]">
        <div className="px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-5">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:text-black transition-colors"
          >
            <ArrowLeft size={17} />
            Kthehu te pronat
          </Link>
        </div>
      </div>
      <div className="px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 md:py-12">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Listing type */}
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${isRent
                  ? 'bg-[#6B4C3B] text-white'
                  : 'bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20'
                }`}
            >
              {isRent ? 'Me Qira' : 'Në Shitje'}
            </span>

            {/* Featured */}
            {property.featured && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#D4AF37] text-black">
                ★ Featured
              </span>
            )}

            {/* Status */}
            {property.status && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#6B4C3B]/15 text-[#6B4C3B]">
                {property.status}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4">
            {property.title}
          </h1>

          <div className="flex items-center gap-2 text-[#6B4C3B]">
            <MapPin size={18} />
            <p>
              {property.location && `${property.location}, `}
              {property.neighborhood && `${property.neighborhood}, `}
              {property.city}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* IMAGE GALLERY */}
        {/* ========================================================= */}

        {property.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">

            {/* Main image */}
            <div className="relative md:row-span-2 h-[320px] md:h-[620px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
              <img
                src={property.images[0].asset.url}
                alt={property.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {property.featured && (
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-2 rounded-full bg-[#D4AF37] text-black text-sm font-semibold">
                    ★ Featured
                  </span>
                </div>
              )}
            </div>

            {/* Second image */}
            {property.images[1] && (
              <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
                <img
                  src={property.images[1].asset.url}
                  alt={`${property.title} - 2`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Third image */}
            {property.images[2] && (
              <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
                <img
                  src={property.images[2].asset.url}
                  alt={`${property.title} - 3`}
                  className="w-full h-full object-cover"
                />

                {property.images.length > 3 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{property.images.length - 3} më shumë
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[400px] rounded-2xl bg-[#F3E9E0] flex flex-col items-center justify-center mb-12">
            <Home size={42} className="text-[#6B4C3B]/40 mb-3" />
            <p className="text-[#6B4C3B]/60">
              Nuk ka fotografi për këtë pronë.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* CONTENT + SIDEBAR */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ======================================================= */}
          {/* MAIN CONTENT */}
          {/* ======================================================= */}

          <div className="lg:col-span-2 space-y-8">

            {/* Property specifications */}
            <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-[#6B4C3B]/10">

                {/* Bedrooms */}
                <div className="p-5 md:p-7 text-center">
                  <BedDouble
                    size={24}
                    className="mx-auto mb-3 text-[#6B4C3B]"
                  />

                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.bedrooms || '-'}
                  </p>

                  <p className="text-sm text-black/50 mt-1">
                    Dhoma
                  </p>
                </div>

                {/* Bathrooms */}
                <div className="p-5 md:p-7 text-center">
                  <Bath
                    size={24}
                    className="mx-auto mb-3 text-[#6B4C3B]"
                  />

                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.bathrooms || '-'}
                  </p>

                  <p className="text-sm text-black/50 mt-1">
                    Banjo
                  </p>
                </div>

                {/* Area */}
                <div className="p-5 md:p-7 text-center">
                  <Ruler
                    size={24}
                    className="mx-auto mb-3 text-[#6B4C3B]"
                  />

                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.area || '-'}
                  </p>

                  <p className="text-sm text-black/50 mt-1">
                    m²
                  </p>
                </div>
              </div>
            </section>

            {/* Description */}
            {property.description && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-5">
                  Përshkrimi
                </h2>

                <p className="text-black/65 leading-8 whitespace-pre-wrap">
                  {property.description}
                </p>
              </section>
            )}

            {/* Features */}
            {property.features.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Veçoritë e pronës
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature: string) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F3EE]"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#F3E9E0] flex items-center justify-center shrink-0">
                        <Check
                          size={15}
                          className="text-[#6B4C3B]"
                        />
                      </div>

                      <span className="text-sm text-black/70">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ======================================================= */}
          {/* SIDEBAR */}
          {/* ======================================================= */}

          <aside className="space-y-5">

            {/* Price */}
            <div className="bg-[#000000] rounded-2xl p-6 md:p-7 text-white">
              <p className="text-sm text-white/50 mb-2">
                Çmimi
              </p>

              <div className="flex items-end gap-2">
                <p className="text-3xl md:text-4xl font-bold">
                  €{Number(property.price).toLocaleString()}
                </p>

                {isRent && (
                  <span className="text-sm text-white/50 mb-1">
                    / muaj
                  </span>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin size={15} />
                  <span>{property.city}</span>
                </div>
              </div>
            </div>

            {/* Agent */}
            {property.primary_agent && (
              <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6">
                <h3 className="text-lg font-bold text-black mb-5">
                  Kontaktoni agjentin
                </h3>

                <div className="flex items-center gap-3 mb-5">
                  {property.primary_agent.image ? (
                    <img
                      src={property.primary_agent.image}
                      alt={
                        property.primary_agent.name || 'Agjent'
                      }
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#F3E9E0] flex items-center justify-center text-[#6B4C3B] font-bold text-lg">
                      {property.primary_agent.name?.charAt(0) || 'A'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-black">
                      {property.primary_agent.name || 'Agjent'}
                    </p>

                    {property.primary_agent.email && (
                      <p className="text-sm text-black/45 truncate">
                        {property.primary_agent.email}
                      </p>
                    )}
                  </div>
                </div>

                {property.primary_agent.phone && (
                  <a
                    href={`tel:${property.primary_agent.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#6B4C3B] hover:bg-[#583e31] text-white font-medium transition-colors"
                  >
                    <Phone size={17} />
                    Telefono agjentin
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 space-y-3">
              <SaveFavoriteButton propertyId={property.id} />

              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#6B4C3B]/20 text-[#6B4C3B] hover:bg-[#F3E9E0] font-medium transition-colors">
                <CalendarDays size={17} />
                Rezervo vizitë
              </button>
            </div>

            {/* Property information */}
            <div className="bg-[#F3E9E0] rounded-2xl p-6">
              <h3 className="font-bold text-black mb-4">
                Informacione
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-black/50">
                    Lloji
                  </span>

                  <span className="font-medium text-black">
                    {isRent ? 'Me Qira' : 'Në Shitje'}
                  </span>
                </div>

                {property.city && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">
                      Qyteti
                    </span>

                    <span className="font-medium text-black">
                      {property.city}
                    </span>
                  </div>
                )}

                {property.area && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">
                      Sipërfaqja
                    </span>

                    <span className="font-medium text-black">
                      {property.area} m²
                    </span>
                  </div>
                )}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  )
}