import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(session.user.id)
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        is_seller: true,
        seller_verified: true,
        role: { select: { name: true } },
      },
    })

    const canUpload =
      (user?.is_seller && user.seller_verified) ||
      user?.role.name === 'ADMIN' ||
      user?.role.name === 'AGENT'

    if (!canUpload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nuk ka skedar' },
        { status: 400 }
      )
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Skedari është shumë i madh (max 5MB)' },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format i pavlefshëm (JPG, PNG, WebP)' },
        { status: 400 }
      )
    }

    // Upload to Sanity
    const buffer = Buffer.from(await file.arrayBuffer())

    const asset = await client.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Gabim gjatë ngarkimit' },
      { status: 500 }
    )
  }
}