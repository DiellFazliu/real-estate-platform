import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'

import {
  analyzePropertyXRay,
  fallbackPropertyXRay,
} from '@/lib/property-xray/analyze'

import { buildDecision } from '@/lib/property-xray/decision'

import type {
  PropertyXRayContext,
} from '@/lib/property-xray/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  propertySlug: z
    .string()
    .trim()
    .min(1)
    .max(200),

  budget: z
    .number()
    .min(0)
    .max(100000000)
    .optional(),

  targetOffer: z
    .number()
    .positive()
    .max(100000000)
    .optional(),
})

function contextFrom(
  property: {
    slug: string
    title: string
    listing_type: string
    price: unknown

    property_type: string | null

    city: string | null
    neighborhood: string | null
    location: string | null
    postal_code: string | null

    area: number | null
    bedrooms: number | null
    bathrooms: number | null

    balconies: number
    floor: number | null
    total_floors: number | null

    year_built: number | null
    renovation_year: number | null
    condition: string | null
    orientation: string | null
    furnished: string | null

    has_parking: boolean
    has_heating: boolean
    has_elevator: boolean
    has_garden: boolean
    has_pool: boolean
    has_air_conditioning: boolean
    has_security: boolean
    has_internet: boolean

    features: string[]
    energy_class: string | null
  }
): PropertyXRayContext {
  return {
    slug: property.slug,
    title: property.title,

    listingType:
      property.listing_type === 'rent'
        ? 'rent'
        : 'sale',

    propertyType:
      property.property_type ??
      'unknown',

    price: Number(property.price),

    city:
      property.city ?? null,

    neighborhood:
      property.neighborhood ?? null,

    location:
      property.location ?? null,

    postalCode:
      property.postal_code ?? null,

    area:
      property.area !== null
        ? Number(property.area)
        : null,

    bedrooms:
      property.bedrooms !== null
        ? Number(property.bedrooms)
        : null,

    bathrooms:
      property.bathrooms !== null
        ? Number(property.bathrooms)
        : null,

    balconies:
      property.balconies !== null
        ? Number(property.balconies)
        : null,

    floor:
      property.floor !== null
        ? Number(property.floor)
        : null,

    totalFloors:
      property.total_floors !== null
        ? Number(property.total_floors)
        : null,

    yearBuilt:
      property.year_built !== null
        ? Number(property.year_built)
        : null,

    renovationYear:
      property.renovation_year !== null
        ? Number(property.renovation_year)
        : null,

    condition:
      property.condition ?? null,

    orientation:
      property.orientation ?? null,

    furnished:
      property.furnished ?? null,

    hasParking:
      Boolean(property.has_parking),

    hasHeating:
      Boolean(property.has_heating),

    hasElevator:
      Boolean(property.has_elevator),

    hasGarden:
      Boolean(property.has_garden),

    hasPool:
      Boolean(property.has_pool),

    hasAirConditioning:
      Boolean(
        property.has_air_conditioning
      ),

    hasSecurity:
      Boolean(property.has_security),

    hasInternet:
      Boolean(property.has_internet),

    features:
      Array.isArray(property.features)
        ? property.features
        : [],

    energyClass:
      property.energy_class ?? null,
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const parsed =
      inputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            'Të dhënat nuk janë të vlefshme.',
          details:
            parsed.error.flatten()
              .fieldErrors,
        },
        { status: 400 }
      )
    }

    const property =
      await prisma.property.findFirst({
        where: {
          slug:
            parsed.data.propertySlug,

          status: 'PUBLISHED',
        },
      })

    if (!property) {
      return NextResponse.json(
        {
          error:
            'Prona nuk u gjet ose nuk është më publike.',
        },
        { status: 404 }
      )
    }

    const context =
      contextFrom(property)

    const decision =
      buildDecision(
        context,
        parsed.data.budget,
        parsed.data.targetOffer
      )

    let result

    try {
      result =
        await analyzePropertyXRay({
          property: context,
        })
    } catch (error) {
      console.warn(
        '[Property X-Ray] AI unavailable; using deterministic fallback',
        error
      )

      result =
        fallbackPropertyXRay(context)
    }

    return NextResponse.json({
      context,
      decision,
      result,
    })
  } catch (error) {
    console.error(
      '[Property X-Ray] analysis failed',
      error
    )

    return NextResponse.json(
      {
        error:
          'Analiza nuk mund të përfundohej tani. Provo përsëri.',
      },
      { status: 502 }
    )
  }
}