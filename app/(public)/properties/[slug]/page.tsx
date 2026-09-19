import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import {
  isPropertyFavorite,
  getPropertyBySlug,
} from '@/lib/db/queries'
import { client } from '@/lib/sanity/client'
import { serializeProperty } from '@/lib/utils/serialize'
import { SaveFavoriteButton } from '@/components/properties/SaveFavoriteButton'
import { PropertyImage } from '@/components/properties/PropertyImage'
import { PropertyMapWrapper } from '@/components/properties/PropertyMapWrapper'
import { AppointmentButton } from '@/components/appointments/AppointmentButton'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Phone,
  CalendarDays,
  Check,
  Home,
  Building2,
  Layers,
  Calendar,
  Compass,
  Sofa,
  Zap,
  Car,
  Waves,
  Trees,
  Shield,
  Wifi,
  Thermometer,
  Sun,
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

// ═══════════════════════════════════════════════════════════════
// LABELS
// ═══════════════════════════════════════════════════════════════

const CONDITION_LABELS: Record<string, string> = {
  new: 'I ri',
  excellent: 'Shumë i mirë',
  good: 'I mirë',
  needs_renovation: 'Kërkon rinovim',
  under_construction: 'Në ndërtim',
}

const FURNISHED_LABELS: Record<string, string> = {
  unfurnished: 'Pa mobilje',
  semi_furnished: 'Gjysmë i mobiluar',
  fully_furnished: 'Plotësisht i mobiluar',
}

const ORIENTATION_LABELS: Record<string, string> = {
  north: 'Veri',
  south: 'Jug',
  east: 'Lindje',
  west: 'Perëndim',
  north_east: 'Veri-Lindje',
  north_west: 'Veri-Perëndim',
  south_east: 'Jug-Lindje',
  south_west: 'Jug-Perëndim',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartament',
  house: 'Shtëpi',
  villa: 'Vilë',
  studio: 'Studio',
  penthouse: 'Penthouse',
  land: 'Truall',
  commercial: 'Lokal komercial',
  office: 'Zyrë',
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK IMAGES
// ═══════════════════════════════════════════════════════════════

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
]

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

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

  // 4. PËRGATIT IMAGES - Me fallback
  let displayImages: string[] = []

  if (property.images && property.images.length > 0) {
    displayImages = property.images.map((img: any) => img.asset.url)
  } else if (property.primary_image_url) {
    displayImages = [property.primary_image_url]
  }

  if (displayImages.length === 0) {
    displayImages = [...FALLBACK_IMAGES]
  }

  while (displayImages.length < 3) {
    displayImages.push(
      FALLBACK_IMAGES[displayImages.length % FALLBACK_IMAGES.length]
    )
  }

  // 5. Check if favorite
  const session = await auth()
  let isFavorite = false

  if (session?.user?.id) {
    const favorite = await isPropertyFavorite(
      Number(session.user.id),
      property.id
    )
    isFavorite = !!favorite
  }

  // ═══════════════════════════════════════════════════════════
  // FEATURES LIST
  // ═══════════════════════════════════════════════════════════
  const featureItems: { icon: any; label: string; value?: string }[] = []

  if (property.property_type) {
    featureItems.push({
      icon: Building2,
      label: 'Tipi i pronës',
      value:
        PROPERTY_TYPE_LABELS[property.property_type] ||
        property.property_type,
    })
  }

  if (property.floor !== null && property.floor !== undefined) {
    featureItems.push({
      icon: Layers,
      label: 'Kati',
      value: `${property.floor}${
        property.total_floors ? ` / ${property.total_floors}` : ''
      }`,
    })
  }

  if (property.year_built) {
    featureItems.push({
      icon: Calendar,
      label: 'Viti i ndërtimit',
      value: String(property.year_built),
    })
  }

  if (property.renovation_year) {
    featureItems.push({
      icon: Calendar,
      label: 'Viti i rinovimit',
      value: String(property.renovation_year),
    })
  }

  if (property.condition) {
    featureItems.push({
      icon: Check,
      label: 'Gjendja',
      value: CONDITION_LABELS[property.condition] || property.condition,
    })
  }

  if (property.orientation) {
    featureItems.push({
      icon: Compass,
      label: 'Orientimi',
      value:
        ORIENTATION_LABELS[property.orientation] || property.orientation,
    })
  }

  if (property.furnished) {
    featureItems.push({
      icon: Sofa,
      label: 'Mobilimi',
      value: FURNISHED_LABELS[property.furnished] || property.furnished,
    })
  }

  if (property.energy_class) {
    featureItems.push({
      icon: Zap,
      label: 'Klasa energjetike',
      value: property.energy_class,
    })
  }

  if (property.balconies) {
    featureItems.push({
      icon: Home,
      label: 'Ballkone',
      value: String(property.balconies),
    })
  }

  // ═══════════════════════════════════════════════════════════
  // AMENITIES
  // ═══════════════════════════════════════════════════════════
  const amenities: { icon: any; label: string }[] = []

  if (property.has_elevator)
    amenities.push({ icon: Layers, label: 'Ashensor' })
  if (property.has_parking) amenities.push({ icon: Car, label: 'Parking' })
  if (property.has_garden) amenities.push({ icon: Trees, label: 'Kopsht' })
  if (property.has_pool) amenities.push({ icon: Waves, label: 'Pishinë' })
  if (property.has_air_conditioning)
    amenities.push({ icon: Thermometer, label: 'Ajër i kondicionuar' })
  if (property.has_heating)
    amenities.push({ icon: Sun, label: 'Ngrohje qendrore' })
  if (property.has_security)
    amenities.push({ icon: Shield, label: 'Sistem sigurie' })
  if (property.has_internet)
    amenities.push({ icon: Wifi, label: 'Internet me fibër' })

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
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
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                isRent
                  ? 'bg-[#6B4C3B] text-white'
                  : 'bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20'
              }`}
            >
              {isRent ? 'Me Qira' : 'Në Shitje'}
            </span>

            {property.featured && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#D4AF37] text-black">
                ★ Featured
              </span>
            )}

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

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
          <div className="relative md:row-span-2 h-[320px] md:h-[620px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
            <PropertyImage
              src={displayImages[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              fallbackSrc={FALLBACK_IMAGES[0]}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
            <PropertyImage
              src={displayImages[1] || FALLBACK_IMAGES[1]}
              alt={`${property.title} - 2`}
              className="w-full h-full object-cover"
              fallbackSrc={FALLBACK_IMAGES[1]}
            />
          </div>

          <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
            <PropertyImage
              src={displayImages[2] || FALLBACK_IMAGES[2]}
              alt={`${property.title} - 3`}
              className="w-full h-full object-cover"
              fallbackSrc={FALLBACK_IMAGES[2]}
            />

            {displayImages.length > 3 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{displayImages.length - 3} më shumë
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key specs */}
            <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-[#6B4C3B]/10">
                <div className="p-5 md:p-7 text-center">
                  <BedDouble
                    size={24}
                    className="mx-auto mb-3 text-[#6B4C3B]"
                  />
                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.bedrooms || '-'}
                  </p>
                  <p className="text-sm text-black/50 mt-1">Dhoma</p>
                </div>
                <div className="p-5 md:p-7 text-center">
                  <Bath size={24} className="mx-auto mb-3 text-[#6B4C3B]" />
                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.bathrooms || '-'}
                  </p>
                  <p className="text-sm text-black/50 mt-1">Banjo</p>
                </div>
                <div className="p-5 md:p-7 text-center">
                  <Ruler size={24} className="mx-auto mb-3 text-[#6B4C3B]" />
                  <p className="text-2xl md:text-3xl font-bold text-black">
                    {property.area || '-'}
                  </p>
                  <p className="text-sm text-black/50 mt-1">m²</p>
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

            {/* DETAILS */}
            {featureItems.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Detajet e pronës
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {featureItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F3EE]"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#F3E9E0] flex items-center justify-center shrink-0">
                          <Icon size={17} className="text-[#6B4C3B]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-black/50 mb-0.5">
                            {item.label}
                          </p>
                          <p className="font-semibold text-black text-sm">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* AMENITIES */}
            {amenities.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Lehtësira
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F3EE]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#F3E9E0] flex items-center justify-center shrink-0">
                          <Icon size={15} className="text-[#6B4C3B]" />
                        </div>
                        <span className="text-sm text-black/70">
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ADDITIONAL FEATURES */}
            {property.features.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Veçoritë shtesë
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: string) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E9E0] text-[#6B4C3B] text-sm font-medium"
                    >
                      <Check size={14} />
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* MAP */}
            {property.latitude && property.longitude && (
              <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Lokacioni
                </h2>
                <div className="mb-4 flex items-center gap-2 text-[#6B4C3B]">
                  <MapPin size={18} />
                  <p>
                    {property.location && `${property.location}, `}
                    {property.neighborhood && `${property.neighborhood}, `}
                    {property.city}
                  </p>
                </div>
                <PropertyMapWrapper
                  latitude={Number(property.latitude)}
                  longitude={Number(property.longitude)}
                  title={property.title}
                  location={`${property.neighborhood || ''}, ${
                    property.city || ''
                  }`}
                />
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5">
            {/* Price */}
            <div className="bg-[#000000] rounded-2xl p-6 md:p-7 text-white">
              <p className="text-sm text-white/50 mb-2">Çmimi</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl md:text-4xl font-bold">
                  €{Number(property.price).toLocaleString()}
                </p>
                {isRent && (
                  <span className="text-sm text-white/50 mb-1">/ muaj</span>
                )}
              </div>

              {property.price_per_m2 && (
                <p className="text-sm text-white/50 mt-2">
                  €{Number(property.price_per_m2).toLocaleString()} / m²
                </p>
              )}

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
                    <PropertyImage
                      src={property.primary_agent.image}
                      alt={property.primary_agent.name || 'Agjent'}
                      className="w-14 h-14 rounded-full object-cover"
                      fallbackSrc="https://ui-avatars.com/api/?name=Agent&background=6B4C3B&color=fff&size=128"
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
              <SaveFavoriteButton
                propertyId={property.id}
                initialIsFavorite={isFavorite}
              />

              {/* ⭐ APPOINTMENT BUTTON */}
              <AppointmentButton
                propertyId={property.id}
                propertyTitle={property.title}
                isAuthenticated={!!session?.user}
              />
            </div>

            {/* Quick Info */}
            <div className="bg-[#F3E9E0] rounded-2xl p-6">
              <h3 className="font-bold text-black mb-4">Informacione</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-black/50">Lloji</span>
                  <span className="font-medium text-black">
                    {isRent ? 'Me Qira' : 'Në Shitje'}
                  </span>
                </div>
                {property.city && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">Qyteti</span>
                    <span className="font-medium text-black">
                      {property.city}
                    </span>
                  </div>
                )}
                {property.neighborhood && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">Lagjja</span>
                    <span className="font-medium text-black">
                      {property.neighborhood}
                    </span>
                  </div>
                )}
                {property.area && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">Sipërfaqja</span>
                    <span className="font-medium text-black">
                      {property.area} m²
                    </span>
                  </div>
                )}
                {property.property_type && (
                  <div className="flex justify-between gap-4">
                    <span className="text-black/50">Tipi</span>
                    <span className="font-medium text-black">
                      {PROPERTY_TYPE_LABELS[property.property_type] ||
                        property.property_type}
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