import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
    },
    orderBy: { published_at: 'desc' },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      city: true,
      neighborhood: true,
      primary_image_url: true,
    },
  })

  return NextResponse.json({ properties })
}