import { prisma } from '@/lib/db/prisma'
import { inngest } from '@/inngest/client'

interface NearbyParams {
  propertyId: number
  city: string | null
  neighborhood: string | null
  property_type: string | null
  listing_type: string
}

export async function invalidateNearbyIntelligence(params: NearbyParams) {
  const { propertyId, city, neighborhood, property_type, listing_type } = params

  if (!city) {
    console.log('⚠️  Cannot invalidate nearby — property has no city')
    return { invalidated: 0, propertyIds: [] as number[] }
  }

  // Gjej pronat e afërta që kanë intelligence
  const nearbyProperties = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city,
      property_type,
      listing_type,
      intelligence: { isNot: null },
    },
    select: { id: true },
    take: 100, // bumped from 50
  })

  if (nearbyProperties.length === 0) {
    console.log(`ℹ️  No nearby properties to invalidate in ${city}`)
    return { invalidated: 0, propertyIds: [] as number[] }
  }

  const ids = nearbyProperties.map((p) => p.id)

  console.log(
    `🔄 Queueing regeneration for ${ids.length} nearby properties in ${city}`,
  )

  // ⭐ FIX: Queue FIRST, then delete
  // If queueing fails partway, we still have old intelligence in DB
  // (better stale than missing) and can retry.
  const queueResults: Array<{ id: number; ok: boolean; error?: string }> = []

  for (const id of ids) {
    try {
      await inngest.send({
        name: 'property/intelligence.requested',
        data: {
          propertyId: id,
          priority: 'low', // skipAI: true → fast, no Groq call
          invalidateNearby: false, // prevent infinite recursion
        },
      })
      queueResults.push({ id, ok: true })
    } catch (error) {
      queueResults.push({
        id,
        ok: false,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  const queued = queueResults.filter((r) => r.ok).map((r) => r.id)
  const failed = queueResults.filter((r) => !r.ok)

  if (failed.length > 0) {
    console.error(
      `⚠️  Failed to queue ${failed.length}/${ids.length} nearby properties:`,
      failed,
    )
  }

  // Delete only what we successfully queued — leave stale data for failures
  // so they can be re-queued later by a cron/backfill job.
  if (queued.length > 0) {
    await prisma.propertyIntelligence.deleteMany({
      where: { property_id: { in: queued } },
    })
  }

  console.log(
    `✅ Invalidated ${queued.length}/${ids.length} nearby properties ` +
      `(${failed.length} failed to queue, kept stale intelligence)`,
  )

  return {
    invalidated: queued.length,
    propertyIds: queued,
  }
}