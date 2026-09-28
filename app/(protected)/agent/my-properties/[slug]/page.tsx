import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { getAgentPropertyBySlug } from '@/lib/data/properties/get-property-detail'
import { AgentPropertyStats } from '@/components/properties/AgentPropertyStats'
import { PropertyHeader } from '@/components/properties/PropertyHeader'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import { PropertySidebar } from '@/components/properties/PropertySidebar'
import { PropertyContent } from '@/components/properties/PropertyContent'

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
            <PropertyHeader property={data.property}>
                <AgentPropertyStats
                    favoritesCount={data.favoritesCount}
                    appointmentsCount={data.appointmentsCount}
                    futureAppointmentsCount={
                        data.futureAppointmentsCount
                    }
                    pastAppointmentsCount={
                        data.pastAppointmentsCount
                    }
                />

                <PropertyGallery
                    property={data.property}
                    displayImages={data.displayImages}
                />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <PropertyContent
                        property={data.property}
                        intelligence={data.intelligence}
                        comparables={data.comparables}
                    />

                    <PropertySidebar
                        property={data.property}
                        isFavorite={false}
                        session={data.session}
                        isAgent
                    />
                </div>
            </PropertyHeader>
        </main>
    )
}