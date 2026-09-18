'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════

const becomeSellerSchema = z.object({
  phone: z
    .string()
    .min(6, 'Telefoni duhet të ketë së paku 6 karaktere')
    .max(20, 'Telefoni nuk mund të ketë më shumë se 20 karaktere')
    .regex(/^[+\d\s()-]+$/, 'Format i pavlefshëm i telefonit'),
  email: z.string().email('Email i pavlefshëm'),
})

// ═══════════════════════════════════════════════════════════════
// ACTION
// ═══════════════════════════════════════════════════════════════

export async function becomeSeller(formData: FormData) {
  try {
    // 1. AUTHENTICATE
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    // 2. VALIDATE
    const parsed = becomeSellerSchema.safeParse({
      phone: formData.get('phone'),
      email: formData.get('email'),
    })

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.phone?.[0] ||
          'Të dhëna të pavlefshme',
      }
    }

    // 3. VERIFY EMAIL MATCHES SESSION
    if (parsed.data.email !== session.user.email) {
      return { success: false, error: 'Email duhet të përputhet me llogarinë' }
    }

    // 4. UPDATE USER
    const userId = parseInt(session.user.id)

    await prisma.user.update({
      where: { id: userId },
      data: {
        is_seller: true,
        seller_verified: true,
        seller_since: new Date(),
        phone: parsed.data.phone,
      },
    })

    // 5. NOTIFY OWNERS
    const owners = await prisma.user.findMany({
      where: { role: { name: { in: ['OWNER', 'ADMIN'] } } },
      select: { id: true },
    })

    for (const owner of owners) {
      await prisma.notification.create({
        data: {
          user_id: owner.id,
          type: 'new_seller',
          title: 'Shitës i ri',
          message: `${session.user.name || session.user.email} u bë shitës`,
          link: '/owner/users',
        },
      })
    }

    // 6. WELCOME NOTIFICATION
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'seller_activated',
        title: 'Llogaria e shitësit u aktivizua',
        message: 'Tani mund të listoni pronat tuaja',
        link: '/sell',
      },
    })

    // 7. REVALIDATE
    revalidatePath('/sell')
    revalidatePath('/account')
    revalidatePath('/become-seller')

    return {
      success: true,
      message: 'U bëre Seller me sukses! Tani mund të listosh prona.',
    }
  } catch (error) {
    console.error('Become seller error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}