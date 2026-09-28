import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { getAgentById } from '@/lib/db/queries/agent'
import { countUnreadMessages } from '@/lib/db/queries/chat'
import AgentSidebar from '@/components/agent/AgentSidebar'
import { countNewInquiries } from '@/lib/db/queries/inquiries'

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/agent')
  }

  if (session.user.role !== 'AGENT') {
    redirect('/')
  }

  const agentId = Number(session.user.id)

const [agent, unreadCount, newInquiriesCount] = await Promise.all([
  getAgentById(agentId),
  countUnreadMessages(agentId),
  countNewInquiries(agentId),
])

  if (!agent || !agent.is_active || agent.role?.name !== 'AGENT') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <AgentSidebar
        agentName={agent.name}
        agentEmail={agent.email}
        unreadCount={unreadCount}
        newInquiriesCount={newInquiriesCount}
      />

      <main className="ml-72 min-h-screen">{children}</main>
    </div>
  )
}