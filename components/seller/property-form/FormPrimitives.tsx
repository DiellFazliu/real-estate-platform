// ═══════════════════════════════════════════════════════════════
// KOMPONENTË PRIMITIVE TË FORMËS
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from 'react'

export const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B] transition-colors'

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-8 space-y-6">
      <h2 className="text-xl font-bold text-black">{title}</h2>
      {children}
    </div>
  )
}

export function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string[]
  children: ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
    </div>
  )
}