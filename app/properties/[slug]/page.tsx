import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { getPropertyBySlug } from '@/lib/db/queries'
import { serializeProperty } from '@/lib/utils/serialize'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params

  // 1. Metadata nga PostgreSQL
  const dbProperty = await getPropertyBySlug(slug)

  if (!dbProperty) notFound()

  // 2. Content nga Sanity
  let sanityContent: any = null
  try {
    sanityContent = await client.fetch(
      `*[_type == "property" && _id == $sanityId][0] {
        description,
        features,
        "images": images[] { asset-> { url } }
      }`,
      { sanityId: dbProperty.sanity_id }
    )
  } catch (error) {
    console.error('Sanity fetch error:', error)
  }

  // 3. Bashko
  const property = {
    ...serializeProperty(dbProperty),
    description: sanityContent?.description || null,
    features: sanityContent?.features || [],
    images: sanityContent?.images || [],
  }

  const isRent = property.listing_type === 'rent'

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="container-page py-12">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition"
        >
          ← Kthehu në pronat
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {property.title}
          </h1>
          <p className="text-white/40 text-lg">
            📍 {property.location && `${property.location}, `}
            {property.neighborhood && `${property.neighborhood}, `}
            {property.city}
          </p>
        </div>

        {/* Images */}
        {property.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {property.images.slice(0, 4).map((img: any, i: number) => (
              <div
                key={i}
                className={`relative rounded-2xl overflow-hidden bg-white/5 ${
                  i === 0 ? 'col-span-2 h-96 md:h-[500px]' : 'h-48 md:h-60'
                }`}
              >
                <img
                  src={img.asset.url}
                  alt={`${property.title} - ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 3 && property.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      +{property.images.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-96 bg-white/5 rounded-2xl flex items-center justify-center mb-8">
            <p className="text-white/20">No images available</p>
          </div>
        )}

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Specs */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {property.bedrooms || '-'}
                </p>
                <p className="text-sm text-white/40 mt-1">Dhoma</p>
              </div>
              <div className="text-center border-l border-r border-white/5">
                <p className="text-3xl font-bold text-white">
                  {property.bathrooms || '-'}
                </p>
                <p className="text-sm text-white/40 mt-1">Banjo</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {property.area || '-'}
                </p>
                <p className="text-sm text-white/40 mt-1">m²</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Përshkrimi</h2>
                <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Features */}
            {property.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Veçoritë</h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: string) => (
                    <span
                      key={feature}
                      className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/60 border border-white/5"
                    >
                      ✨ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price */}
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <p className="text-sm text-blue-400 mb-2">Çmimi</p>
              <p className="text-4xl font-bold text-white mb-1">
                €{Number(property.price).toLocaleString()}
              </p>
              {isRent && <p className="text-sm text-white/40">në muaj</p>}
            </div>

            {/* Status */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm text-white/40 mb-2">Statusi</p>
              <p className="text-xl font-bold text-green-400">
                {isRent ? 'Me Qira' : 'Në Shitje'}
              </p>
            </div>

            {/* Contact */}
            {property.primary_agent && (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Agjenti</h3>
                <div className="flex items-center gap-3 mb-4">
                  {property.primary_agent.image ? (
                    <img
                      src={property.primary_agent.image}
                      alt={property.primary_agent.name || 'Agent'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {property.primary_agent.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {property.primary_agent.name || 'Agent'}
                    </p>
                    <p className="text-white/40 text-sm">
                      {property.primary_agent.email}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${property.primary_agent.phone}`}
                  className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-xl font-medium transition"
                >
                  📞 Telefono
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <button className="w-full py-3 btn btn-secondary">
                ❤️ Ruaj Pronën
              </button>
              <button className="w-full py-3 btn btn-secondary">
                📅 Rezervo Vizitë
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}