'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const becomeSellerSchema = z.object({
  email: z.string().email('Email i pavlefshëm'),
  phone: z
    .string()
    .min(8, 'Numri i telefonit është shumë i shkurtër')
    .max(20, 'Numri i telefonit është shumë i gjatë'),
})

export async function becomeSeller(formData: FormData) {
  try {
    // 1. Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    // 2. Validate
    const parsed = becomeSellerSchema.safeParse({
      email: formData.get('email'),
      phone: formData.get('phone'),
    })

    if (!parsed.success) {
      return { success: false, error: 'Të dhëna të pavlefshme' }
    }

    // 3. Update user
    const userId = parseInt(session.user.id)
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: parsed.data.phone,
        is_seller: true,
        seller_since: new Date(),
        seller_verified: true,
      },
    })

    // 4. Notify owners
    const owners = await prisma.user.findMany({
      where: { role: { name: { in: ['OWNER', 'ADMIN'] } } },
    })

    for (const owner of owners) {
      await prisma.notification.create({
        data: {
          user_id: owner.id,
          type: 'new_seller',
          title: 'Shitës i re',
          message: `${session.user.name || session.user.email} u bë shitës`,
          link: '/owner/users',
        },
      })
    }

    // 5. Welcome notification
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'seller_activated',
        title: 'Llogaria e shitësit u aktivizua',
        message: 'Tani mund të listoni pronat tuaja',
        link: '/sell',
      },
    })

    revalidatePath('/account')
    revalidatePath('/sell')

    return { success: true, message: 'Llogaria e shitësit u aktivizua!' }
  } catch (error) {
    console.error('becomeSeller error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}
