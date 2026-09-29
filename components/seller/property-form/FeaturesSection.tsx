// ═══════════════════════════════════════════════════════════════
// SEKSIONI 3: VEÇORITË
// ═══════════════════════════════════════════════════════════════

import { Section, FormField, inputClass } from './FormPrimitives'
import { BOOLEAN_FEATURES, type PropertyFormInitialData } from './types'

interface Props {
  initialData?: PropertyFormInitialData
  features: string[]
  featureInput: string
  onFeatureInputChange: (value: string) => void
  onAddFeature: () => void
  onRemoveFeature: (index: number) => void
}

export function FeaturesSection({
  initialData,
  features,
  featureInput,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature,
}: Props) {
  return (
    <Section title="Veçoritë">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BOOLEAN_FEATURES.map((feature) => (
          <label
            key={feature.name}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#6B4C3B] cursor-pointer transition"
          >
            <input
              type="checkbox"
              name={feature.name}
              defaultChecked={
                initialData
                  ? Boolean(
                      initialData[feature.name as keyof PropertyFormInitialData]
                    )
                  : false
              }
              className="w-5 h-5 accent-[#6B4C3B]"
            />
            <span className="text-sm text-gray-700">{feature.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <input
          type="text"
          value={featureInput}
          onChange={(e) => onFeatureInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAddFeature()
            }
          }}
          className={`${inputClass} flex-1`}
          placeholder="Veçori shtesë (p.sh. Smart Home, Fireplace)"
        />
        <button
          type="button"
          onClick={onAddFeature}
          className="px-6 py-3 bg-[#6B4C3B] text-white rounded-lg hover:bg-[#4A342A]"
        >
          Shto
        </button>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <span
              key={`${feature}-${index}`}
              className="px-4 py-2 bg-[#F3E9E0] text-[#6B4C3B] rounded-full text-sm flex items-center gap-2"
            >
              {feature}
              <button
                type="button"
                onClick={() => onRemoveFeature(index)}
                className="text-[#6B4C3B] hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </Section>
  )
}