import { inngest } from '../client'
import { generatePropertyIntelligence } from '@/lib/intelligence/generate'
import { invalidateNearbyIntelligence } from '@/lib/intelligence/invalidate-nearby'
import { prisma } from '@/lib/db/prisma'

interface IntelligenceEventData {
  propertyId: number
  priority?: 'high' | 'normal' | 'low'
  invalidateNearby?: boolean
}

export const generateIntelligenceFunction = inngest.createFunction(
  {
    id: 'generate-property-intelligence',
    name: 'Generate Property Intelligence',
    retries: 5,
    concurrency: {
      limit: 1,
      key: 'groq-rate-limit',
    },
    triggers: [{ event: 'property/intelligence.requested' }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const {
      propertyId,
      priority = 'normal',
      invalidateNearby = false,
    } = event.data as IntelligenceEventData

    // Only 'high' and 'normal' use AI. 'low' skips it for speed/cost.
    const skipAI = priority === 'low'

    const intelligence = await step.run('generate-intelligence', async () => {
      return await generatePropertyIntelligence(propertyId, { skipAI })
    })

    if (invalidateNearby && intelligence) {
      await step.run('invalidate-nearby', async () => {
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
          select: {
            city: true,
            neighborhood: true,
            property_type: true,
            listing_type: true,
          },
        })

        if (!property?.city) return { invalidated: 0, propertyIds: [] }

        return await invalidateNearbyIntelligence({
          propertyId,
          city: property.city,
          neighborhood: property.neighborhood,
          property_type: property.property_type,
          listing_type: property.listing_type,
        })
      })
    }

    return { success: true, intelligence }
  },
)