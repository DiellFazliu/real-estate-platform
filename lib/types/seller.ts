'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const becomeSellerSchema = z.object({
  phone: z
    .string()
    .min(6, 'Telefoni duhet të ketë së paku 6 karaktere')
    .max(20, 'Telefoni nuk mund të ketë më shumë se 20 karaktere')
    .regex(/^[+\d\s()-]+$/, 'Format i pavlefshëm i telefonit'),
  email: z.string().email('Email i pavlefshëm'),
})

export async function becomeSeller(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const parsed = becomeSellerSchema.safeParse({
      phone: formData.get('phone'),
      email: formData.get('email'),
    })

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.flatten().fieldErrors.phone?.[0] || 'Të dhëna të pavlefshme',
      }
    }

    // Verify email matches session
    if (parsed.data.email !== session.user.email) {
      return { success: false, error: 'Email duhet të përputhet me llogarinë' }
    }

    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        is_seller: true,
        seller_verified: true,
        seller_since: new Date(),
        phone: parsed.data.phone,
      },
    })

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