'use client'

import { Check, GitCompareArrows } from 'lucide-react'
import { useCompare, type CompareProperty } from './CompareProvider'

interface CompareButtonProps {
  property: CompareProperty
}

export function CompareButton({ property }: CompareButtonProps) {
  const {
    isSelected,
    toggleProperty,
    canAddMore,
    maxCompare,
    selectedProperties,
  } = useCompare()

  const selected = isSelected(property.id)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!selected && !canAddMore) {
      return
    }

    toggleProperty(property)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={
        selected
          ? `Hiq ${property.title} nga krahasimi`
          : `Shto ${property.title} në krahasim`
      }
      title={
        selected
          ? 'Hiq nga krahasimi'
          : !canAddMore
            ? `Mund të krahasohen maksimumi ${maxCompare} prona`
            : 'Shto në krahasim'
      }
      className={`flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold shadow-md transition-all ${
        selected
          ? 'bg-[#6B4C3B] text-white hover:bg-[#563B2E]'
          : 'bg-white text-[#6B4C3B] hover:bg-[#F3E9E0]'
      } ${
        !selected && !canAddMore
          ? 'cursor-not-allowed opacity-60'
          : ''
      }`}
    >
      {selected ? (
        <>
          <Check className="h-4 w-4" />
          Krahasim
        </>
      ) : (
        <>
          <GitCompareArrows className="h-4 w-4" />
          Krahaso
        </>
      )}

      {selected && (
        <span className="text-xs opacity-80">
          {selectedProperties.length}/{maxCompare}
        </span>
      )}
    </button>
  )
}