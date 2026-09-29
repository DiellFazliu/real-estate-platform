// ═══════════════════════════════════════════════════════════════
// SEKSIONI 4: LOKACIONI
// ═══════════════════════════════════════════════════════════════

import { Section, FormField, inputClass } from './FormPrimitives'
import { MapPicker } from '../MapPickerWrapper'
import { CITIES, getNeighborhoods } from '@/lib/data/locations'
import type { PropertyFormInitialData } from './types'

interface Props {
  initialData?: PropertyFormInitialData
  fieldErrors: Record<string, string[]>
  selectedCity: string
  selectedNeighborhood: string
  coordinates: { lat: number; lng: number } | null
  onCityChange: (city: string) => void
  onNeighborhoodChange: (neighborhood: string) => void
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void
}

export function LocationSection({
  initialData,
  fieldErrors,
  selectedCity,
  selectedNeighborhood,
  coordinates,
  onCityChange,
  onNeighborhoodChange,
  onCoordinatesChange,
}: Props) {
  const availableNeighborhoods = selectedCity
    ? getNeighborhoods(selectedCity)
    : []

  return (
    <Section title="Lokacioni">
      <FormField label="Adresa" required>
        <input
          type="text"
          name="location"
          required
          defaultValue={initialData?.location ?? ''}
          className={inputClass}
          placeholder="Rr. Nëna Terezë, Nr. 45"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Qyteti" required>
          <select
            name="city"
            required
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Zgjidh qytetin...</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Lagjja" required error={fieldErrors.neighborhood}>
          <select
            name="neighborhood"
            required
            value={selectedNeighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            disabled={!selectedCity}
            className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">
              {selectedCity ? 'Zgjidh lagjen...' : 'Zgjidh qytetin fillimisht'}
            </option>
            {availableNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kodi Postar">
          <input
            type="text"
            name="postalCode"
            defaultValue={initialData?.postalCode ?? ''}
            className={inputClass}
            placeholder="10000"
          />
        </FormField>
        <FormField label="Distanca nga Qendra (km)">
          <input
            type="number"
            name="distanceFromCenter"
            min={0}
            step={0.1}
            defaultValue={initialData?.distanceFromCenter ?? ''}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Zgjidh lokacionin në hartë" required>
        <MapPicker
          initialLat={coordinates?.lat}
          initialLng={coordinates?.lng}
          onLocationSelect={onCoordinatesChange}
        />
        {coordinates && (
          <div className="mt-2 text-sm text-gray-600">
            📍 Lat: {coordinates.lat.toFixed(6)}, Lng:{' '}
            {coordinates.lng.toFixed(6)}
          </div>
        )}
      </FormField>
    </Section>
  )
}