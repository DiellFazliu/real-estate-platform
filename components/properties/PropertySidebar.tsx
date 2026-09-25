import { MapPin, Phone } from 'lucide-react'
import { AppointmentButton } from '@/components/appointments/AppointmentButton'
import { PropertyImage } from '@/components/properties/PropertyImage'
import { SaveFavoriteButton } from '@/components/properties/SaveFavoriteButton'
import { PROPERTY_TYPE_LABELS } from '@/lib/properties/property-labels'
import type { PropertyPageData } from './types'

interface PropertySidebarProps
  extends Pick<PropertyPageData, 'property' | 'isFavorite' | 'session'> {
  isAgent?: boolean
}

export function PropertySidebar({
  property,
  isFavorite,
  session,
  isAgent = false,
}: PropertySidebarProps) {
  const isRent = property.listing_type === 'rent'

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-2xl bg-[#000000] p-6 text-white md:p-7">
        <p className="mb-2 text-sm text-white/50">
          Çmimi
        </p>

        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold md:text-4xl">
            €{Number(property.price).toLocaleString()}
          </p>

          {isRent && (
            <span className="mb-1 text-sm text-white/50">
              / muaj
            </span>
          )}
        </div>

        {property.price_per_m2 && (
          <p className="mt-2 text-sm text-white/50">
            €{Number(property.price_per_m2).toLocaleString()} / m²
          </p>
        )}

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin size={15} />
            <span>{property.city}</span>
          </div>
        </div>
      </div>

      {property.primary_agent && (
        <div className="rounded-2xl border border-[#6B4C3B]/10 bg-white p-6">
          <h3 className="mb-5 text-lg font-bold text-black">
            Kontaktoni agjentin
          </h3>

          <div className="mb-5 flex items-center gap-3">
            {property.primary_agent.image ? (
              <PropertyImage
                src={property.primary_agent.image}
                alt={property.primary_agent.name || 'Agjent'}
                className="h-14 w-14 rounded-full object-cover"
                fallbackSrc="https://ui-avatars.com/api/?name=Agent&background=6B4C3B&color=fff&size=128"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E9E0] text-lg font-bold text-[#6B4C3B]">
                {property.primary_agent.name?.charAt(0) || 'A'}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-semibold text-black">
                {property.primary_agent.name || 'Agjent'}
              </p>

              {property.primary_agent.email && (
                <p className="truncate text-sm text-black/45">
                  {property.primary_agent.email}
                </p>
              )}

              {property.primary_agent.phone && (
                <p className="truncate text-sm text-black/45">
                  {property.primary_agent.phone}
                </p>
              )}
            </div>
          </div>

          {property.primary_agent.phone && (
            <a
              href={`tel:${property.primary_agent.phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] py-3.5 font-medium text-white transition-colors hover:bg-[#583e31]"
            >
              <Phone size={17} />
              Telefono agjentin
            </a>
          )}
        </div>
      )}

      {!isAgent && (
        <div className="space-y-3 rounded-2xl border border-[#6B4C3B]/10 bg-white p-6">
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
      )}

      <div className="rounded-2xl bg-[#F3E9E0] p-6">
        <h3 className="mb-4 font-bold text-black">
          Informacione
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-black/50">
              Lloji
            </span>

            <span className="font-medium text-black">
              {isRent ? 'Me Qira' : 'Në Shitje'}
            </span>
          </div>

          {property.city && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">
                Qyteti
              </span>

              <span className="font-medium text-black">
                {property.city}
              </span>
            </div>
          )}

          {property.neighborhood && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">
                Lagjja
              </span>

              <span className="font-medium text-black">
                {property.neighborhood}
              </span>
            </div>
          )}

          {property.area && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">
                Sipërfaqja
              </span>

              <span className="font-medium text-black">
                {property.area} m²
              </span>
            </div>
          )}

          {property.property_type && (
            <div className="flex justify-between gap-4">
              <span className="text-black/50">
                Tipi
              </span>

              <span className="font-medium text-black">
                {PROPERTY_TYPE_LABELS[property.property_type] ||
                  property.property_type}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}