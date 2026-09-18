import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()

    // User must be logged in
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Duhet të jeni të kyçur për të ruajtur një pronë.' },
        { status: 401 }
      )
    }

    // Find current user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Përdoruesi nuk u gjet.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const propertyId = Number(body.propertyId)

    if (!propertyId || Number.isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID e pronës nuk është valide.' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Prona nuk u gjet.' },
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

    if (existingFavorite) {
      return NextResponse.json(
        {
          message: 'Prona është tashmë në favorites.',
          favorite: existingFavorite,
        },
        { status: 200 }
      )
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        user_id: user.id,
        property_id: propertyId,
      },
    })

    // Update favorite counter
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
        favorite,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add favorite error:', error)

    return NextResponse.json(
      { error: 'Ndodhi një gabim gjatë ruajtjes së pronës.' },
      { status: 500 }
    )
  }
}