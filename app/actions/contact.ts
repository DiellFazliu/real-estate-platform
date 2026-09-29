'use server'

/**
 * app/actions/contact.ts
 *
 * Public server action for the contact form.
 * Flow:
 *   1. Validate input with Zod
 *   2. Read optional session (works for guests too)
 *   3. Assign inquiry to an agent via round-robin (least-loaded)
 *   4. Insert inquiry + in-app notification atomically (one transaction)
 *   5. Revalidate the agent's inquiry list
 *
 * The Inquiry model has no dedicated `subject` column — it is encoded into
 * the message body as `[Subject]\n\nBody` and decoded on the agent side.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { pickAvailableAgent } from '@/lib/db/queries/chat'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Emri është shumë i shkurtër.').max(120),
  email: z.string().trim().email('Email-i nuk është i saktë.').max(255),
  subject: z.string().trim().min(2, 'Subjekti është shumë i shkurtër.').max(200),
  message: z.string().trim().min(10, 'Mesazhi është shumë i shkurtër.').max(4000),
})

export async function submitContactForm(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message || 'Të dhënat nuk janë të sakta.',
    }
  }

  const { name, email, subject, message } = parsed.data

  try {
    const session = await auth()
    const userId = session?.user?.id ? Number(session.user.id) : null

    // Round-robin: agent with the fewest open conversations
    const agent = await pickAvailableAgent()

    const inquiry = await prisma.$transaction(async (tx) => {
      const created = await tx.inquiry.create({
        data: {
          user_id: userId,
          agent_id: agent?.id ?? null,
          name,
          email,
          message: `[${subject}]\n\n${message}`,
          status: 'NEW',
        },
      })

      if (agent?.id) {
        await tx.notification.create({
          data: {
            user_id: agent.id,
            type: 'new_inquiry',
            title: 'Kërkesë e re kontakti',
            message: `${name} (${email}): ${subject}`,
            link: `/agent/inquiries/${created.id}`,
          },
        })
      }

      return created
    })

    revalidatePath('/agent/inquiries')

    return {
      success: true as const,
      inquiryId: inquiry.id,
      agentName: agent?.name ?? null,
      agentEmail: agent?.email ?? null,
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      success: false as const,
      error: 'Mesazhi nuk u dërgua. Provoni përsëri.',
    }
  }
}