import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyListingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const listings = await prisma.property.findMany({
    where: { listed_by_id: parseInt(session.user.id) },
    orderBy: { created_at: 'desc' },
  })

  const statusColors = {
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    PENDING_REVIEW: 'Në Pritje',
    APPROVED: 'I Aprovuar',
    REJECTED: 'I Refuzuar',
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Listimet e Mia</h1>
            <p className="text-[#6B4C3B]/60 mt-2">
              {listings.length} listime totale
            </p>
          </div>
          <Link
            href="/sell"
            className="px-6 py-3 bg-[#6B4C3B] text-white rounded-lg hover:bg-[#4A342A]"
          >
            + Shto Pronë të Re
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-[#6B4C3B]/60 mb-4">
              Nuk ke listime ende. Filloni duke shtuar pronën e parë.
            </p>
            <Link
              href="/sell"
              className="inline-block px-6 py-2 bg-[#6B4C3B] text-white rounded-lg"
            >
              Shto Pronë
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-black">
                    {listing.title}
                  </h2>
                  <p className="text-[#6B4C3B] font-medium mt-1">
                    €{Number(listing.price).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    {listing.neighborhood && (
                      <span>📍 {listing.neighborhood}</span>
                    )}
                    {listing.city && <span>🏙️ {listing.city}</span>}
                    {listing.bedrooms && <span>🛏️ {listing.bedrooms} dhoma</span>}
                    {listing.bathrooms && <span>🚿 {listing.bathrooms} banjo</span>}
                    {listing.area && <span>📐 {listing.area} m²</span>}
                  </div>
                  {listing.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2">
                      Arsyeja e refuzimit: {listing.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[
                        listing.review_status as keyof typeof statusColors
                      ]
                    }`}
                  >
                    {
                      statusLabels[
                        listing.review_status as keyof typeof statusLabels
                      ]
                    }
                  </span>
                  <Link
                    href={`/properties/${listing.slug}`}
                    className="text-sm text-[#6B4C3B] hover:underline"
                  >
                    Shiko →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}