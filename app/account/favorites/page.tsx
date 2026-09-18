import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { FavoriteCard } from '@/components/prototype/FavoriteCard'

export default async function FavoritesPage() {
  const session = await auth()

  // User must be logged in
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/favorites')
  }

  // Find the current user
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Get the user's favorites
  const favorites = await prisma.favorite.findMany({
    where: {
      user_id: user.id,
    },
    include: {
      property: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      {/* Header */}
      <section className="bg-[#F3E9E0] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#6B4C3B]">
            Your Collection
          </p>

          <h1 className="font-serif text-4xl font-semibold text-[#000000] md:text-5xl">
            Favorite Properties
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
            Keep track of the properties you are interested in and come back
            to them whenever you are ready.
          </p>

          <div className="mt-6 inline-flex items-center rounded-full bg-[#000000] px-4 py-2 text-sm text-white">
            {favorites.length}{' '}
            {favorites.length === 1 ? 'property' : 'properties'} saved
          </div>
        </div>
      </section>

      {/* Favorites */}
      <section className="px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          {favorites.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <FavoriteCard
                  key={favorite.id}
                  favoriteId={favorite.id}
                  property={{
                    id: favorite.property.id,
                    slug: favorite.property.slug,
                    title: favorite.property.title,
                    price: favorite.property.price.toString(),
                    location: favorite.property.location,
                    city: favorite.property.city,
                    neighborhood: favorite.property.neighborhood,
                    propertyType: favorite.property.property_type,
                    bedrooms: favorite.property.bedrooms,
                    bathrooms: favorite.property.bathrooms,
                    area: favorite.property.area,
                    image: favorite.property.primary_image_url,
                    status: favorite.property.status,
                    listingType: favorite.property.listing_type,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function EmptyFavorites() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E9E0]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-9 w-9 text-[#6B4C3B]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </div>

      <h2 className="font-serif text-2xl font-semibold text-[#000000]">
        No favorites yet
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
        When you find a property you love, click the heart icon to save it
        here.
      </p>

      <a
        href="/properties"
        className="mt-7 rounded-full bg-[#000000] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B4C3B]"
      >
        Explore Properties
      </a>
    </div>
  )
}