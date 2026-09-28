import { Bath, BedDouble, Check, MapPin, Ruler, type LucideIcon } from 'lucide-react'
import { EnhancedMapWrapper } from '@/components/properties/EnhancedMapWrapper'
import { RevaIntelligence } from '@/components/properties/RevaIntelligence'
import { getPropertyAmenities, getPropertyFeatures } from '@/lib/properties/property-display'
import type { PropertyPageData } from '@/components/properties/types'

function PropertyStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon
  value: number | null
  label: string
}) {
  return (
    <div className="p-5 text-center md:p-7">
      <Icon size={24} className="mx-auto mb-3 text-[#6B4C3B]" />
      <p className="text-2xl font-bold text-black md:text-3xl">{value || '-'}</p>
      <p className="mt-1 text-sm text-black/50">{label}</p>
    </div>
  )
}

export function PropertyContent({
  property,
  intelligence,
  comparables,
}: Pick<PropertyPageData, 'property' | 'intelligence' | 'comparables'>) {
  const featureItems = getPropertyFeatures(property)
  const amenities = getPropertyAmenities(property)
  const location = `${property.neighborhood || ''}, ${property.city || ''}`

  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-[#6B4C3B]/10">
          <PropertyStat icon={BedDouble} value={property.bedrooms} label="Dhoma" />
          <PropertyStat icon={Bath} value={property.bathrooms} label="Banjo" />
          <PropertyStat icon={Ruler} value={property.area} label="m²" />
        </div>
      </section>

      <RevaIntelligence
        intelligence={intelligence}
        comparables={comparables}
      />

      {property.description && (
        <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-5">
            Përshkrimi
          </h2>
          <p className="text-black/65 leading-8 whitespace-pre-wrap">
            {property.description}
          </p>
        </section>
      )}

      {featureItems.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Detajet e pronës
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featureItems.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F3EE]"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F3E9E0] flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-[#6B4C3B]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-black/50 mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-semibold text-black text-sm">
                      {item.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {amenities.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Opcionet dhe pajisjet e pronës
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F3EE]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F3E9E0] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#6B4C3B]" />
                  </div>
                  <span className="text-sm text-black/70">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {property.features.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Veçoritë shtesë
          </h2>
          <div className="flex flex-wrap gap-2">
            {property.features.map((feature: string) => (
              <span
                key={feature}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E9E0] text-[#6B4C3B] text-sm font-medium"
              >
                <Check size={14} />
                {feature}
              </span>
            ))}
          </div>
        </section>
      )}

      {property.latitude && property.longitude && (
        <section className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Lokacioni
          </h2>
          <div className="mb-4 flex items-center gap-2 text-[#6B4C3B]">
            <MapPin size={18} />
            <p>
              {property.location && `${property.location}, `}
              {property.neighborhood && `${property.neighborhood}, `}
              {property.city}
            </p>
          </div>
          <EnhancedMapWrapper
            latitude={Number(property.latitude)}
            longitude={Number(property.longitude)}
            title={property.title}
            location={location}
            propertyId={property.id}
            price={Number(property.price)}
            pricePerM2={property.price_per_m2 ? Number(property.price_per_m2) : null}
          />
        </section>
      )}
    </div>
  )
}
