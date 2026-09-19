import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const addFavoriteSchema = z.object({
  propertyId: z.number().int().positive(),
})

const removeFavoriteSchema = z.object({
  favoriteId: z.number().int().positive(),
})

// ═══════════════════════════════════════════════════════════════
// GET - List favorites
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { user_id: parseInt(session.user.id) },
      include: {
        property: {
          select: {
            id: true,
            slug: true,
            title: true,
            price: true,
            location: true,
            city: true,
            neighborhood: true,
            property_type: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            primary_image_url: true,
            status: true,
            listing_type: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Serialize Decimal → number
    const serialized = favorites.map((f) => ({
      id: f.id,
      property: {
        ...f.property,
        price: Number(f.property.price),
        image: f.property.primary_image_url,
        propertyType: f.property.property_type,
        listingType: f.property.listing_type,
      },
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('GET favorites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Add favorite
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = addFavoriteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { propertyId } = parsed.data
    const userId = parseInt(session.user.id)

    // Kontrollo nëse ekziston
    const existing = await prisma.favorite.findUnique({
      where: {
        user_id_property_id: {
          user_id: userId,
          property_id: propertyId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already favorited',
        favoriteId: existing.id,
      })
    }

    const favorite = await prisma.favorite.create({
      data: {
        user_id: userId,
        property_id: propertyId,
      },
    })

    // Increment favorite_count
    await prisma.property.update({
      where: { id: propertyId },
      data: { favorite_count: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      favoriteId: favorite.id,
      favorite,
    })
  } catch (error) {
    console.error('POST favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE - Remove favorite
// ═══════════════════════════════════════════════════════════════
// Pranon: { favoriteId } ose { propertyId }

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const userId = parseInt(session.user.id)

    // ═══════════════════════════════════════════════════════════
    // Opsioni 1: favoriteId
    // ═══════════════════════════════════════════════════════════
    if (body.favoriteId) {
      const favoriteId = parseInt(body.favoriteId)

      const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
      })

      if (!favorite) {
        return NextResponse.json(
          { error: 'Favorite not found' },
          { status: 404 }
        )
      }

      // Kontrollo që favoriti i përket user-it
      if (favorite.user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await prisma.favorite.delete({
        where: { id: favoriteId },
      })

      // Decrement favorite_count
      await prisma.property.update({
        where: { id: favorite.property_id },
        data: { favorite_count: { decrement: 1 } },
      })

      return NextResponse.json({ success: true })
    }

    // ═══════════════════════════════════════════════════════════
    // Opsioni 2: propertyId
    // ═══════════════════════════════════════════════════════════
    if (body.propertyId) {
      const propertyId = parseInt(body.propertyId)

      const favorite = await prisma.favorite.findUnique({
        where: {
          user_id_property_id: {
            user_id: userId,
            property_id: propertyId,
          },
        },
      })

      if (!favorite) {
        return NextResponse.json(
          { error: 'Favorite not found' },
          { status: 404 }
        )
      }

      await prisma.favorite.delete({
        where: {
          user_id_property_id: {
            user_id: userId,
            property_id: propertyId,
          },
        },
      })

      // Decrement favorite_count
      await prisma.property.update({
        where: { id: propertyId },
        data: { favorite_count: { decrement: 1 } },
      })

      return NextResponse.json({ success: true })
    }

    // ═══════════════════════════════════════════════════════════
    // Asnjë opsion
    // ═══════════════════════════════════════════════════════════
    return NextResponse.json(
      { error: 'favoriteId or propertyId is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('DELETE favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}