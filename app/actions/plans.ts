'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function selectPlan(planId: string) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/upload-listing')

  if (!['basic', 'premium', 'agency'].includes(planId)) {
    return { success: false, error: 'Plan i pavlefshëm' }
  }

  await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: {
      plan: planId,
      plan_updated_at: new Date(),
    },
  })

  revalidatePath('/upload-listing')
  revalidatePath('/sell-for-yourself')

  return { success: true }
}