'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function updateAgentProfile(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  if (session.user.role !== 'AGENT') {
    throw new Error('Unauthorized')
  }

  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const bio = String(formData.get('bio') || '').trim()

  if (!name) {
    throw new Error('Emri është i detyrueshëm')
  }

  await prisma.user.update({
    where: {
      id: Number(session.user.id),
    },
    data: {
      name,
      phone: phone || null,
      bio: bio || null,
    },
  })

  revalidatePath('/agent/profile')
  revalidatePath('/agent')
}