// ═══════════════════════════════════════════════════════════════
// SEKSIONI 1: INFORMACIONET BAZË
// ═══════════════════════════════════════════════════════════════

import { Section, FormField, inputClass } from './FormPrimitives'
import { AIDescriptionHelper } from '../AIDescriptionHelper'
import { PROPERTY_TYPES, type PropertyFormInitialData } from './types'

interface Props {
  initialData?: PropertyFormInitialData
  fieldErrors: Record<string, string[]>
  onPropertyTypeChange: (type: string) => void
}

export function BasicInfoSection({
  initialData,
  fieldErrors,
  onPropertyTypeChange,
}: Props) {
  return (
    <Section title="Informacionet Bazë">
      <FormField label="Titulli" required error={fieldErrors.title}>
        <input
          type="text"
          name="title"
          required
          minLength={10}
          maxLength={100}
          defaultValue={initialData?.title ?? ''}
          className={inputClass}
          placeholder="P.sh. Apartament Modern 3+1 në Qendër"
        />
      </FormField>

      <AIDescriptionHelper
        onGenerate={(description) => {
          const textarea = document.querySelector(
            'textarea[name="description"]'
          ) as HTMLTextAreaElement
          if (textarea) textarea.value = description
        }}
      />

      <FormField label="Përshkrimi" required error={fieldErrors.description}>
        <textarea
          name="description"
          required
          minLength={50}
          maxLength={2000}
          rows={6}
          defaultValue={initialData?.description ?? ''}
          className={inputClass}
          placeholder="Përshkruani pronën në detaje..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Çmimi (€)" required>
          <input
            type="number"
            name="price"
            required
            min={100}
            max={10000000}
            defaultValue={initialData?.price ?? ''}
            className={inputClass}
          />
        </FormField>

        <FormField label="Lloji i listimit" required>
          <select
            name="listingType"
            required
            defaultValue={initialData?.listingType ?? ''}
            className={inputClass}
          >
            <option value="">Zgjidh...</option>
            <option value="sale">Për Shitje</option>
            <option value="rent">Me Qira</option>
          </select>
        </FormField>
      </div>

      <FormField label="Tipi i pronës" required>
        <select
          name="propertyType"
          required
          defaultValue={initialData?.propertyType ?? ''}
          onChange={(e) => onPropertyTypeChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Zgjidh...</option>
          {PROPERTY_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    </Section>
  )
}