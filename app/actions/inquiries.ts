'use server'

/**
 * app/actions/inquiries.ts
 *
 * Agent-side server action for the inquiries feature.
 * `markInquiryResponded` flips an inquiry to RESPONDED and stamps
 * `responded_at`. Ownership is enforced by matching `agent_id` — an
 * agent cannot mark another agent's inquiry as responded.
 * Idempotent: calling it twice on an already-responded inquiry is a
 * no-op that still returns success.
 */

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