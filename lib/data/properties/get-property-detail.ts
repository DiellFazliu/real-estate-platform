import { auth } from '@/lib/auth/auth'
import { unstable_cache } from 'next/cache'
import { isPropertyFavorite, getPropertyBySlug } from '@/lib/db/queries/queries'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'
import { serializeProperty } from '@/lib/utils/serialize'
import { findComparables, type ComparableProperty } from '@/lib/intelligence/price-engine'
import { getDisplayImages } from '@/lib/properties/property-display'

interface SanityPropertyContent {
  description?: string | null
  features?: string[] | null
  images?: Array<{ asset?: { url?: string | null } | null }> | null
}

async function fetchSanityPropertyContent(
  sanityId: string,
): Promise<SanityPropertyContent | null> {
  return unstable_cache(
    async () => {
      try {
        return await client.fetch<SanityPropertyContent>(
          `*[_type == "property" && _id == $sanityId][0] {
            description,
            features,
            "images": images[] { asset-> { url } }
          }`,
          { sanityId },
        )
      } catch (error: unknown) {
        console.error('Sanity fetch error:', error)
        return null
      }
    },
    ['sanity-property-content', sanityId],
    { revalidate: 60 },
  )()
}

function mergeSanityContent(
  dbProperty: Awaited<ReturnType<typeof getPropertyBySlug>>,
  sanityContent: SanityPropertyContent | null,
) {
  if (!dbProperty) return null

  return {
    ...serializeProperty(dbProperty),
    description: sanityContent?.description || null,
    features: sanityContent?.features || [],
    images: sanityContent?.images || [],
  }
}

async function fetchIntelligence(propertyId: number) {
  try {
    return await prisma.propertyIntelligence.findUnique({
      where: { property_id: propertyId },
    })
  } catch (error: unknown) {
    console.error('Intelligence fetch error:', error)
    return null
  }
}

export async function getPropertyDetail(slug: string) {
  const dbProperty = await getPropertyBySlug(slug)
  if (!dbProperty) return null

  const [sanityContent, session] = await Promise.all([
    fetchSanityPropertyContent(dbProperty.sanity_id),
    auth(),
  ])

  const property = mergeSanityContent(dbProperty, sanityContent)

  const [favorite, intelligence, comparables] = await Promise.all([
    session?.user?.id ? isPropertyFavorite(Number(session.user.id), property.id) : Promise.resolve(null),
    fetchIntelligence(dbProperty.id),
    findComparables(dbProperty.id, 3, dbProperty).catch((error: unknown) => {
      console.error('Intelligence fetch error:', error)
      return [] as ComparableProperty[]
    }),
  ])

  return {
    property,
    displayImages: getDisplayImages(property.images, property.primary_image_url),
    isFavorite: !!favorite,
    session,
    intelligence,
    comparables,
  }
}


export async function getAgentPropertyBySlug(
  slug: string,
  agentId: number
) {
  const dbProperty = await prisma.property.findFirst({
    where: {
      slug,
      OR: [
        {
          primary_agent_id: agentId,
        },
        {
          agents: {
            some: {
              agent_id: agentId,
              status: 'ACTIVE',
            },
          },
        },
      ],
    },
    include: {
      _count: {
        select: {
          favorites: true,
          appointments: true,
        },
      },
    },
  })
  if (!dbProperty) {
    return null
  }

  const favoritesCount = dbProperty._count.favorites
  const appointmentsCount = dbProperty._count.appointments

  const [sanityContent, session] = await Promise.all([
    fetchSanityPropertyContent(dbProperty.sanity_id),
    auth(),
  ])

  const property = mergeSanityContent(dbProperty, sanityContent)

  const [intelligence, comparables] = await Promise.all([
    fetchIntelligence(dbProperty.id),

    findComparables(dbProperty.id, 3, dbProperty).catch(
      (error: unknown) => {
        console.error('Comparables fetch error:', error)
        return [] as ComparableProperty[]
      }
    ),
  ])

  return {
    property,
    displayImages: getDisplayImages(
      property.images,
      property.primary_image_url
    ),
    isFavorite: false,
    session,
    intelligence,
    comparables,
    favoritesCount,
    appointmentsCount,
  }
}