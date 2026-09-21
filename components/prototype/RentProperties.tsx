import { getRentProperties } from '@/lib/db/queries/queries'
import { PropertyCard } from '@/components/shared/PropertyCard'

export async function RentProperties() {
  const properties = await getRentProperties(3)

  if (properties.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#6B4C3B]/10 bg-white px-6 text-center shadow-sm">
        <div className="mb-4 text-6xl">🔑</div>
        <p className="text-base text-[#000000]/50">
          Nuk ka prona me qira
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property: any) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}