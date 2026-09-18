import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  return await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  })
}

// ============================================================
// ADD TO FAVORITES
// ============================================================

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          error: 'Duhet të jeni të kyçur për të ruajtur një pronë.',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const propertyId = Number(body.propertyId)

    if (!propertyId || Number.isNaN(propertyId)) {
      return NextResponse.json(
        {
          error: 'ID e pronës nuk është valide.',
        },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      select: {
        id: true,
      },
    })

    if (!property) {
      return NextResponse.json(
        {
          error: 'Prona nuk u gjet.',
        },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        user_id_property_id: {
          user_id: user.id,
          property_id: propertyId,
        },
      },
    })

    // Already favorite
    if (existingFavorite) {
      return NextResponse.json({
        message: 'Prona është tashmë në favorites.',
        isFavorite: true,
      })
    }

    // Create favorite
    await prisma.favorite.create({
      data: {
        user_id: user.id,
        property_id: propertyId,
      },
    })

    // Increase favorite counter
    await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        favorite_count: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Prona u ruajt me sukses.',
        isFavorite: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add favorite error:', error)

    return NextResponse.json(
      {
        error: 'Ndodhi një gabim gjatë ruajtjes së pronës.',
      },
      { status: 500 }
    )
  }
}

// ============================================================
// REMOVE FROM FAVORITES
// ============================================================

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          error: 'Duhet të jeni të kyçur.',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const propertyId = Number(body.propertyId)

    if (!propertyId || Number.isNaN(propertyId)) {
      return NextResponse.json(
        {
          error: 'ID e pronës nuk është valide.',
        },
        { status: 400 }
      )
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_property_id: {
          user_id: user.id,
          property_id: propertyId,
        },
      },
    })

    // Already removed
    if (!favorite) {
      return NextResponse.json({
        message: 'Prona nuk është në favorites.',
        isFavorite: false,
      })
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        user_id_property_id: {
          user_id: user.id,
          property_id: propertyId,
        },
      },
    })

    // Decrease favorite counter
    await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        favorite_count: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      message: 'Prona u largua nga favorites.',
      isFavorite: false,
    })
  } catch (error) {
    console.error('Remove favorite error:', error)

    return NextResponse.json(
      {
        error: 'Ndodhi një gabim gjatë largimit të pronës.',
      },
      { status: 500 }
    )
  }
}