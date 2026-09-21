'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Më të rejat' },
  { value: 'price_asc', label: 'Çmimi: nga më i ulëti' },
  { value: 'price_desc', label: 'Çmimi: nga më i larti' },
  { value: 'area_asc', label: 'Sipërfaqja: nga më e vogla' },
  { value: 'area_desc', label: 'Sipërfaqja: nga më e madhja' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

export function SortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = (searchParams.get('sort') as SortValue) || 'newest'
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === current)?.label || 'Më të rejat'

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSelect = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'newest') {
      params.delete('sort') // default → clean URL
    } else {
      params.set('sort', value)
    }

    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-[#6B4C3B]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#6B4C3B] shadow-sm transition hover:border-[#6B4C3B] hover:text-[#000000]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-[#6B4C3B]/70">↕</span>
        <span className="hidden sm:inline">Rendit:</span>
        <span className="font-semibold text-[#000000]">{currentLabel}</span>
        <span
          className={`text-[10px] text-[#6B4C3B] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-[#6B4C3B]/15 bg-white shadow-xl"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === current
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={active}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                  active
                    ? 'bg-[#F3E9E0] font-semibold text-[#6B4C3B]'
                    : 'text-[#000000]/70 hover:bg-[#F3E9E0]/50 hover:text-[#000000]'
                }`}
              >
                <span>{opt.label}</span>
                {active && <span className="text-[#6B4C3B]">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}