import { inngest } from '../client'
import { prisma } from '@/lib/db/prisma'

// ═══════════════════════════════════════════════════════════════
// WEEKLY FULL REFRESH
// ═══════════════════════════════════════════════════════════════
// Runs every Sunday at 3 AM. Queues low-priority (no-AI) regeneration
// for every published property so comparables stay fresh even if the
// invalidation cascade missed some (e.g., >100 neighbors).

export const refreshAllIntelligenceFunction = inngest.createFunction(
  {
    id: 'refresh-all-intelligence',
    name: 'Weekly Full Intelligence Refresh',
    retries: 3,
    concurrency: {
      limit: 1,
      key: 'refresh-all',
    },
    triggers: [{ cron: 'TZ=Europe/Berlin 0 3 * * 0' }], // Sundays 3 AM
  },
  async ({ step }: { step: any }) => {
    const BATCH_SIZE = 200
    let cursor: number | undefined = undefined
    let totalQueued = 0
    let batchesProcessed = 0

    while (true) {
      // Fetch one batch of approved properties without intelligence OR
      // with old intelligence (>7 days old).
      const batch = await step.run(
        `fetch-batch-${batchesProcessed}`,
        async () => {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

          return prisma.property.findMany({
            where: {
              status: 'PUBLISHED',
              review_status: 'APPROVED',
              OR: [
                { intelligence: null },
                { intelligence: { generated_at: { lt: sevenDaysAgo } } },
              ],
            },
            select: { id: true },
            orderBy: { id: 'asc' },
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          })
        },
      )

      if (batch.length === 0) break

      // Queue each property
      const queued = await step.run(
        `queue-batch-${batchesProcessed}`,
        async () => {
          let count = 0
          for (const p of batch) {
            try {
              await inngest.send({
                name: 'property/intelligence.requested',
                data: {
                  propertyId: p.id,
                  priority: 'low', // no AI — cheap
                  invalidateNearby: false,
                },
              })
              count++
            } catch (err) {
              console.error(`Failed to queue property ${p.id}:`, err)
            }
          }
          return count
        },
      )

      totalQueued += queued
      batchesProcessed++
      cursor = batch[batch.length - 1].id

      if (batch.length < BATCH_SIZE) break
      if (batchesProcessed > 50) {
        console.warn('Refresh job hit batch limit — will continue next week')
        break
      }
    }

    console.log(
      `🔄 Weekly refresh queued ${totalQueued} properties across ${batchesProcessed} batches`,
    )

    return { totalQueued, batchesProcessed }
  },
)