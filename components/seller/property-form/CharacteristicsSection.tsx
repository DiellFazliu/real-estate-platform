// ═══════════════════════════════════════════════════════════════
// SEKSIONI 2: KARAKTERISTIKAT - DINAMIK SIPAS TIPIT
// ═══════════════════════════════════════════════════════════════

import { Section, FormField, inputClass } from './FormPrimitives'
import {
  CONDITION_OPTIONS,
  ORIENTATION_OPTIONS,
  FURNISHED_OPTIONS,
  ENERGY_OPTIONS,
  getPropertyTypeConfig,
  type PropertyFormInitialData,
} from './types'

interface Props {
  initialData?: PropertyFormInitialData
  /** Tipi aktual i pronës, i kontrolluar nga prindi */
  propertyType: string
}

export function CharacteristicsSection({ initialData, propertyType }: Props) {
  const config = getPropertyTypeConfig(propertyType)

  // ⭐ Trualli ka shumë pak fusha
  if (propertyType === 'land') {
    return (
      <Section title="Karakteristikat e Truallit">
        <div className="grid grid-cols-2 gap-4">
          <FormField label={config.areaLabel}>
            <input
              type="number"
              name="area"
              min={10}
              defaultValue={initialData?.area ?? ''}
              className={inputClass}
              placeholder="P.sh. 500"
            />
          </FormField>

          <FormField label="Gjendja">
            <select
              name="condition"
              defaultValue={initialData?.condition ?? 'good'}
              className={inputClass}
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Section>
    )
  }

  return (
    <Section title="Karakteristikat">
      {/* ─── RRESHTI 1: DHOMA, BANJO, SIPËRFAQJA, BALLKONE ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {config.hasBedrooms && (
          <FormField label={config.bedroomsLabel ?? 'Dhoma'}>
            <input
              type="number"
              name="bedrooms"
              min={0}
              max={20}
              defaultValue={initialData?.bedrooms ?? ''}
              className={inputClass}
            />
          </FormField>
        )}

        {config.hasBathrooms && (
          <FormField label="Banjo">
            <input
              type="number"
              name="bathrooms"
              min={0}
              max={20}
              defaultValue={initialData?.bathrooms ?? ''}
              className={inputClass}
            />
          </FormField>
        )}

        <FormField label={config.areaLabel}>
          <input
            type="number"
            name="area"
            min={10}
            defaultValue={initialData?.area ?? ''}
            className={inputClass}
          />
        </FormField>

        {config.hasBalconies && (
          <FormField label="Ballkone">
            <input
              type="number"
              name="balconies"
              min={0}
              max={10}
              defaultValue={initialData?.balconies ?? 0}
              className={inputClass}
            />
          </FormField>
        )}
      </div>

      {/* ─── RRESHTI 2: KATI, VITI ─── */}
      {(config.hasFloors || config.hasYearBuilt) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.hasFloors && (
            <>
              <FormField label="Kati">
                <input
                  type="number"
                  name="floor"
                  min={-2}
                  max={50}
                  defaultValue={initialData?.floor ?? ''}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Kati Total">
                <input
                  type="number"
                  name="totalFloors"
                  min={1}
                  max={100}
                  defaultValue={initialData?.totalFloors ?? ''}
                  className={inputClass}
                />
              </FormField>
            </>
          )}
          {config.hasYearBuilt && (
            <>
              <FormField label="Viti i Ndërtimit">
                <input
                  type="number"
                  name="yearBuilt"
                  min={1900}
                  max={2030}
                  defaultValue={initialData?.yearBuilt ?? ''}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Viti i Rinovimit">
                <input
                  type="number"
                  name="renovationYear"
                  min={1900}
                  max={2030}
                  defaultValue={initialData?.renovationYear ?? ''}
                  className={inputClass}
                />
              </FormField>
            </>
          )}
        </div>
      )}

      {/* ─── RRESHTI 3: GJENDJA, ORIENTIMI, MOBILIMI, ENERGJIA ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField label="Gjendja">
          <select
            name="condition"
            defaultValue={initialData?.condition ?? 'good'}
            className={inputClass}
          >
            {CONDITION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        {config.hasOrientation && (
          <FormField label="Orientimi">
            <select
              name="orientation"
              defaultValue={initialData?.orientation ?? ''}
              className={inputClass}
            >
              {ORIENTATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {config.hasFurnished && (
          <FormField label="Mobilimi">
            <select
              name="furnished"
              defaultValue={initialData?.furnished ?? 'unfurnished'}
              className={inputClass}
            >
              {FURNISHED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {config.hasEnergyClass && (
          <FormField label="Klasa Energjetike">
            <select
              name="energyClass"
              defaultValue={initialData?.energyClass ?? ''}
              className={inputClass}
            >
              {ENERGY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v || 'Zgjidh...'}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </div>
    </Section>
  )
}