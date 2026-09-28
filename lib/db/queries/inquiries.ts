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