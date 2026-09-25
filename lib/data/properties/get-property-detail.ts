import { auth } from '@/lib/auth/auth'
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

export async function getPropertyDetail(slug: string) {
  const dbProperty = await getPropertyBySlug(slug)
  if (!dbProperty) return null

  const [sanityContent, session] = await Promise.all([
    client.fetch<SanityPropertyContent>(
      `*[_type == "property" && _id == $sanityId][0] { description, features, "images": images[] { asset-> { url } } }`,
      { sanityId: dbProperty.sanity_id }
    ).catch((error: unknown) => {
      console.error('Sanity fetch error:', error)
      return null
    }),
    auth(),
  ])

  const property = {
    ...serializeProperty(dbProperty),
    description: sanityContent?.description || null,
    features: sanityContent?.features || [],
    images: sanityContent?.images || [],
  }

  const [favorite, intelligence, comparables] = await Promise.all([
    session?.user?.id ? isPropertyFavorite(Number(session.user.id), property.id) : Promise.resolve(null),
    prisma.propertyIntelligence.findUnique({ where: { property_id: dbProperty.id } }).catch((error: unknown) => {
      console.error('Intelligence fetch error:', error)
      return null
    }),
    findComparables(dbProperty.id, 3).catch((error: unknown) => {
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
      agents: {
        some: {
          agent_id: agentId,
          status: 'ACTIVE',
        },
      },
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
    client
      .fetch<SanityPropertyContent>(
        `*[_type == "property" && _id == $sanityId][0] {
          description,
          features,
          "images": images[] {
            asset-> {
              url
            }
          }
        }`,
        {
          sanityId: dbProperty.sanity_id,
        }
      )
      .catch((error: unknown) => {
        console.error('Sanity fetch error:', error)
        return null
      }),
    auth(),
  ])

  const property = {
    ...serializeProperty(dbProperty),
    description: sanityContent?.description || null,
    features: sanityContent?.features || [],
    images: sanityContent?.images || [],
  }

  const [intelligence, comparables] = await Promise.all([
    prisma.propertyIntelligence
      .findUnique({
        where: {
          property_id: dbProperty.id,
        },
      })
      .catch((error: unknown) => {
        console.error('Intelligence fetch error:', error)
        return null
      }),

    findComparables(dbProperty.id, 3).catch(
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