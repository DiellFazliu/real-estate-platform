'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

const heroSlideSchema = z.object({
  title: z.string().min(3).max(100),
  subtitle: z.string().max(100).optional().nullable(),
  price: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  badge: z.string().max(30).optional().nullable(),
  image_url: z.string().url(),
  property_id: z.number().optional().nullable(),
  custom_url: z.string().url().optional().nullable(),
  order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

// ═══════════════════════════════════════════════════════════════
// HELPER - Check permission
// ═══════════════════════════════════════════════════════════════

async function checkOwnerAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: { role: true },
  })

  if (!user) return false
  return ['OWNER', 'ADMIN'].includes(user.role.name)
}

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

export async function createHeroSlide(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (!(await checkOwnerAccess(session.user.id))) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const parsed = heroSlideSchema.safeParse({
      title: formData.get('title'),
      subtitle: formData.get('subtitle') || null,
      price: formData.get('price') || null,
      description: formData.get('description') || null,
      badge: formData.get('badge') || null,
      image_url: formData.get('image_url'),
      property_id: formData.get('property_id')
        ? Number(formData.get('property_id'))
        : null,
      custom_url: formData.get('custom_url') || null,
      order: Number(formData.get('order') || 0),
      is_active: formData.get('is_active') === 'on',
    })

    if (!parsed.success) {
      return {
        success: false,
        error: 'Të dhëna të pavlefshme',
        details: parsed.error.flatten().fieldErrors,
      }
    }

    const slide = await prisma.heroSlide.create({
      data: {
        ...parsed.data,
        source: 'MANUAL',
        created_by_id: parseInt(session.user.id),
      },
    })

    revalidatePath('/')
    revalidatePath('/owner/hero-slides')

    return { success: true, slide }
  } catch (error: any) {
    console.error('Create hero slide error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

export async function updateHeroSlide(id: number, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (!(await checkOwnerAccess(session.user.id))) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const parsed = heroSlideSchema.safeParse({
      title: formData.get('title'),
      subtitle: formData.get('subtitle') || null,
      price: formData.get('price') || null,
      description: formData.get('description') || null,
      badge: formData.get('badge') || null,
      image_url: formData.get('image_url'),
      property_id: formData.get('property_id')
        ? Number(formData.get('property_id'))
        : null,
      custom_url: formData.get('custom_url') || null,
      order: Number(formData.get('order') || 0),
      is_active: formData.get('is_active') === 'on',
    })

    if (!parsed.success) {
      return { success: false, error: 'Të dhëna të pavlefshme' }
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: parsed.data,
    })

    revalidatePath('/')
    revalidatePath('/owner/hero-slides')

    return { success: true, slide }
  } catch (error: any) {
    console.error('Update hero slide error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

export async function deleteHeroSlide(id: number) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (!(await checkOwnerAccess(session.user.id))) {
      return { success: false, error: 'Nuk ke leje' }
    }

    await prisma.heroSlide.delete({ where: { id } })

    revalidatePath('/')
    revalidatePath('/owner/hero-slides')

    return { success: true }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// TOGGLE
// ═══════════════════════════════════════════════════════════════

export async function toggleHeroSlide(id: number) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const slide = await prisma.heroSlide.findUnique({ where: { id } })
    if (!slide) return { success: false, error: 'Slide nuk u gjet' }

    await prisma.heroSlide.update({
      where: { id },
      data: { is_active: !slide.is_active },
    })

    revalidatePath('/')
    revalidatePath('/owner/hero-slides')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Gabim i brendshëm' }
  }
}