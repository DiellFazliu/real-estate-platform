import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import {
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Pencil,
    Eye,
    Plus,
} from 'lucide-react'
import { getAgentProperties } from '@/lib/db/queries/agent'

export default async function MyPropertiesPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const properties = await getAgentProperties(
        Number(session.user.id)
    )

    return (
        <div className="p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
                        Menaxhimi
                    </p>

                    <h1 className="font-serif text-4xl text-[#171310]">
                        Pronat e mia
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Menaxho pronat që janë të caktuara për ty.
                    </p>
                </div>

                <Link
                    href="/agent/my-properties/new"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#573c2f]"
                >
                    <Plus size={18} />
                    Shto pronë
                </Link>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Gjithsej
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#171310]">
                        {properties.length}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Aktive
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-green-600">
                        {
                            properties.filter(
                                (property) =>
                                    property.status?.toLowerCase() === 'active' ||
                                    property.status?.toLowerCase() === 'published'
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Featured
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#B89548]">
                        {properties.filter((property) => property.featured).length}
                    </p>
                </div>
            </div>

            {/* Properties */}
            {properties.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E9E0]">
                        <Plus className="text-[#6B4C3B]" />
                    </div>

                    <h2 className="font-serif text-2xl text-[#171310]">
                        Nuk ke asnjë pronë
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Shto pronën tënde të parë për ta menaxhuar nga dashboard-i.
                    </p>

                    <Link
                        href="/agent/my-properties/new"
                        className="mt-6 inline-flex rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white"
                    >
                        Shto pronë
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                {/* Property preview */}
                                <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-[#E9DDD3] lg:w-40">
                                    <span className="font-serif text-lg text-[#6B4C3B]/50">
                                        Villaron
                                    </span>
                                </div>

                                {/* Information */}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h2 className="font-serif text-xl text-[#171310]">
                                            {property.title}
                                        </h2>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${property.listing_type === 'rent'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {property.listing_type === 'rent'
                                                ? 'Me Qira'
                                                : 'Në Shitje'}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin size={14} />
                                        {property.location || property.city || 'Pa lokacion'}
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        {property.bedrooms != null && (
                                            <span className="flex items-center gap-1">
                                                <BedDouble size={14} />
                                                {property.bedrooms} dhoma
                                            </span>
                                        )}

                                        {property.bathrooms != null && (
                                            <span className="flex items-center gap-1">
                                                <Bath size={14} />
                                                {property.bathrooms} banjo
                                            </span>
                                        )}

                                        {property.area != null && (
                                            <span className="flex items-center gap-1">
                                                <Maximize size={14} />
                                                {property.area} m²
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="lg:text-right">
                                    <p className="text-xl font-semibold text-[#6B4C3B]">
                                        €{Number(property.price).toLocaleString()}
                                    </p>

                                    <p className="text-xs capitalize text-gray-400">
                                        {property.status}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 lg:flex-col">
                                    <Link
                                        href={`/properties/${property.slug}`}
                                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                                    >
                                        <Eye size={16} />
                                        Shiko
                                    </Link>

                                    <Link
                                        href={`/agent/my-properties/${property.id}/edit`}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-[#6B4C3B] px-4 py-2 text-sm text-white transition hover:bg-[#573c2f]"
                                    >
                                        <Pencil size={16} />
                                        Ndrysho
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}