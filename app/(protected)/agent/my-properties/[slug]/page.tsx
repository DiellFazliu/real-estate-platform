import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { PropertyDetailLayout } from '@/components/properties/PropertyDetailLayout'
import { getAgentPropertyBySlug } from '@/lib/data/properties/get-property-detail'
import { AgentPropertyStats } from '@/components/properties/AgentPropertyStats'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AgentPropertyDetailPage({
  params,
}: Props) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const agentId = Number(session.user.id)
  if (!Number.isInteger(agentId)) {
    redirect('/login')
  }

  const data = await getAgentPropertyBySlug(slug, agentId)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#000000]">
      <PropertyDetailLayout
        property={data.property}
        displayImages={data.displayImages}
        intelligence={data.intelligence}
        comparables={data.comparables}
        isFavorite={false}
        session={data.session}
        isAgent
        beforeGallery={
          <AgentPropertyStats
            favoritesCount={data.favoritesCount}
            appointmentsCount={data.appointmentsCount}
          />
        }
      />
    </main>
  )
}