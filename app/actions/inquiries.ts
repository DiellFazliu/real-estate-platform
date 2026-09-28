'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function markInquiryResponded(inquiryId: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const agentId = Number(session.user.id)

  const inquiry = await prisma.inquiry.findFirst({
    where: { id: inquiryId, agent_id: agentId },
    select: { id: true, status: true },
  })

  if (!inquiry) {
    return { success: false, error: 'Kërkesa nuk u gjet.' }
  }

  if (inquiry.status === 'RESPONDED') {
    return { success: true, alreadyResponded: true }
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      status: 'RESPONDED',
      responded_at: new Date(),
    },
  })

  revalidatePath('/agent/inquiries')
  revalidatePath(`/agent/inquiries/${inquiryId}`)

  return { success: true }
}