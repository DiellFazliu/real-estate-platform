import { getFeaturedProperties } from '@/lib/db/queries/queries'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function FeaturedProperties() {
  const properties = await getFeaturedProperties(6)

  if (properties.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#6B4C3B]/10 bg-white px-6 text-center shadow-sm">
        <div className="mb-4 text-6xl">🏠</div>
        <p className="text-base text-[#000000]/50">
          Nuk ka prona të zgjedhura
        </p>
      </div>
    )
  }

  // ⭐ Batch fetch favoritet (jashtë cache-t)
  const session = await auth()
  let favoritedIds = new Set<number>()

  if (session?.user?.id) {
    const favs = await prisma.favorite.findMany({
      where: {
        user_id: parseInt(session.user.id),
        property_id: { in: properties.map((p: any) => p.id) },
      },
      select: { property_id: true },
    })
    favoritedIds = new Set(favs.map((f) => f.property_id))
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property: any) => (
        <PropertyCard
          key={property.id}
          property={{
            ...property,
            featured: true,
          }}
          isFavorite={favoritedIds.has(property.id)}
          isAuthenticated={!!session?.user}
        />
      ))}
    </div>
  )
}