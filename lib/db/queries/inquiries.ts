/**
 * lib/db/queries/inquiries.ts
 *
 * Read-only Prisma queries for the inquiries feature.
 * All three are scoped by `agent_id` — the agent_id column is indexed,
 * so these are all index-backed lookups.
 *
 * `getAgentInquiries` is capped at 100 to keep the agent inbox bounded;
 * pagination can be added later if the cap starts hiding real items.
 */

import { prisma } from '@/lib/db/prisma'

export async function getAgentInquiries(agentId: number) {
  return prisma.inquiry.findMany({
    where: { agent_id: agentId },
    orderBy: { created_at: 'desc' },
    take: 100,
  })
}

export async function getAgentInquiryById(inquiryId: number, agentId: number) {
  return prisma.inquiry.findFirst({
    where: { id: inquiryId, agent_id: agentId },
  })
}

export async function countNewInquiries(agentId: number) {
  return prisma.inquiry.count({
    where: { agent_id: agentId, status: 'NEW' },
  })
}