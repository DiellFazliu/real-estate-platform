import { MapPin, Phone } from 'lucide-react'
import { AppointmentButton } from '@/components/appointments/AppointmentButton'
import { PropertyImage } from '@/components/properties/PropertyImage'
import { SaveFavoriteButton } from '@/components/properties/SaveFavoriteButton'
import { PROPERTY_TYPE_LABELS } from '@/lib/properties/property-labels'
import type { PropertyPageData } from './types'

export function PropertySidebar({
  property,
  isFavorite,
  session,
}: Pick<PropertyPageData, 'property' | 'isFavorite' | 'session'>) {
  const isRent = property.listing_type === 'rent'

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
      <div className="bg-[#000000] rounded-2xl p-6 md:p-7 text-white">
        <p className="text-sm text-white/50 mb-2">Çmimi</p>
        <div className="flex items-end gap-2">
          <p className="text-3xl md:text-4xl font-bold">
            €{Number(property.price).toLocaleString()}
          </p>
          {isRent && (
            <span className="text-sm text-white/50 mb-1">/ muaj</span>
          )}
        </div>

        {property.price_per_m2 && (
          <p className="text-sm text-white/50 mt-2">
            €{Number(property.price_per_m2).toLocaleString()} / m²
          </p>
        )}

        <div className="mt-5 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <MapPin size={15} />
            <span>{property.city}</span>
          </div>
        </div>
      </div>

      {property.primary_agent && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6">
          <h3 className="text-lg font-bold text-black mb-5">
            Kontaktoni agjentin
          </h3>
          <div className="flex items-center gap-3 mb-5">
            {property.primary_agent.image ? (
              <PropertyImage
                src={property.primary_agent.image}
                alt={property.primary_agent.name || 'Agjent'}
                className="w-14 h-14 rounded-full object-cover"
                fallbackSrc="https://ui-avatars.com/api/?name=Agent&background=6B4C3B&color=fff&size=128"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#F3E9E0] flex items-center justify-center text-[#6B4C3B] font-bold text-lg">
                {property.primary_agent.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-black">
                {property.primary_agent.name || 'Agjent'}
              </p>
              {property.primary_agent.email && (
                <p className="text-sm text-black/45 truncate">
                  {property.primary_agent.email}
                </p>
              )}
              {property.primary_agent.phone && (
                <p className="text-sm text-black/45 truncate">
                  {property.primary_agent.phone}
                </p>
              )}
            </div>
          </div>
          {property.primary_agent.phone && (
            <a
              href={`tel:${property.primary_agent.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#6B4C3B] hover:bg-[#583e31] text-white font-medium transition-colors"
            >
              <Phone size={17} />
              Telefono agjentin
            </a>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 space-y-3">
        <SaveFavoriteButton
          propertyId={property.id}
          initialIsFavorite={isFavorite}
        />
        <AppointmentButton
          propertyId={property.id}
          propertyTitle={property.title}
          isAuthenticated={!!session?.user}
        />
      </div>

      <div className="bg-[#F3E9E0] rounded-2xl p-6">
        <h3 className="font-bold text-black mb-4">Informacione</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-black/50">Lloji</span>
            <span className="font-medium text-black">
              {isRent ? 'Me Qira' : 'Në Shitje'}
            </span>
          </div>
          {property.city && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">Qyteti</span>
              <span className="font-medium text-black">{property.city}</span>
            </div>
          )}
          {property.neighborhood && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">Lagjja</span>
              <span className="font-medium text-black">
                {property.neighborhood}
              </span>
            </div>
          )}
          {property.area && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">Sipërfaqja</span>
              <span className="font-medium text-black">
                {property.area} m²
              </span>
            </div>
          )}
          {property.property_type && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">Tipi</span>
              <span className="font-medium text-black">
                {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
