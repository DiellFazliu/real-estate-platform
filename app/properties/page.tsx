import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'
import { PropertyCard } from '@/components/shared/PropertyCard'
import Link from 'next/link'

interface PropertiesPageProps {
  searchParams: Promise<{
    q?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    type?: string
  }>
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const params = await searchParams

  const where: any = {
    status: 'PUBLISHED',
    review_status: 'APPROVED',
  }

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { city: { contains: params.q, mode: 'insensitive' } },
      { neighborhood: { contains: params.q, mode: 'insensitive' } },
    ]
  }

  if (params.city) {
    where.city = { contains: params.city, mode: 'insensitive' }
  }

  if (params.bedrooms) {
    where.bedrooms = { gte: parseInt(params.bedrooms) }
  }

  if (params.type) {
    where.listing_type = params.type
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice)
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice)
  }

  const [dbProperties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
      take: 24,
    }),
    prisma.property.count({ where }),
  ])

  const properties = serializeProperties(dbProperties)

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="container-page py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {params.q ? `Kërkim: "${params.q}"` : 'Të Gjitha Pronat'}
          </h1>
          <p className="text-white/40">
            {total} {total === 1 ? 'pronë' : 'prona'} u gjetën
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-white/40 text-lg mb-4">Asnjë pronë nuk u gjet</p>
            <Link href="/" className="btn btn-primary">
              Kthehu në Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}