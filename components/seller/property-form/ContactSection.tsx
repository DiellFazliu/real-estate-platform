// ═══════════════════════════════════════════════════════════════
// SEKSIONI 6: KONTAKTI
// ═══════════════════════════════════════════════════════════════

import { Section, FormField, inputClass } from './FormPrimitives'
import type { PropertyFormInitialData } from './types'

interface Props {
  initialData?: PropertyFormInitialData
}

export function ContactSection({ initialData }: Props) {
  return (
    <Section title="Kontakti">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Telefoni" required>
          <input
            type="tel"
            name="contactPhone"
            required
            defaultValue={initialData?.contactPhone ?? ''}
            className={inputClass}
            placeholder="+383 44 123 456"
          />
        </FormField>
        <FormField label="Email" required>
          <input
            type="email"
            name="contactEmail"
            required
            defaultValue={initialData?.contactEmail ?? ''}
            className={inputClass}
          />
        </FormField>
      </div>
    </Section>
  )
}