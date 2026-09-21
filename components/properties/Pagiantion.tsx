'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Build URL for a given page, preserving all other params
  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page') // clean URL for page 1
    } else {
      params.set('page', String(page))
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex h-10 items-center rounded-xl border border-[#6B4C3B]/15 bg-white px-4 text-sm font-semibold text-[#6B4C3B] transition hover:border-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white"
        >
          ← Kthehu
        </Link>
      ) : (
        <span className="flex h-10 cursor-not-allowed items-center rounded-xl border border-[#6B4C3B]/10 bg-white/50 px-4 text-sm font-semibold text-[#000000]/25">
          ← Kthehu
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-sm text-[#000000]/40"
            >
              …
            </span>
          ) : p === currentPage ? (
            <span
              key={p}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B4C3B] text-sm font-bold text-white shadow-sm"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p as number)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6B4C3B]/15 bg-white text-sm font-medium text-[#6B4C3B] transition hover:border-[#6B4C3B] hover:bg-[#F3E9E0]"
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex h-10 items-center rounded-xl border border-[#6B4C3B]/15 bg-white px-4 text-sm font-semibold text-[#6B4C3B] transition hover:border-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white"
        >
          Vazhdo →
        </Link>
      ) : (
        <span className="flex h-10 cursor-not-allowed items-center rounded-xl border border-[#6B4C3B]/10 bg-white/50 px-4 text-sm font-semibold text-[#000000]/25">
          Vazhdo →
        </span>
      )}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE NUMBER GENERATOR
// ═══════════════════════════════════════════════════════════════
// Returns something like: [1, '…', 4, 5, 6, '…', 12]
// Always shows first and last, current ± 1, with ellipses for gaps.

function getPageNumbers(
  current: number,
  total: number
): (number | '…')[] {
  const pages: (number | '…')[] = []
  const window = 1 // pages on each side of current

  const start = Math.max(2, current - window)
  const end = Math.min(total - 1, current + window)

  pages.push(1)

  if (start > 2) pages.push('…')

  for (let i = start; i <= end; i++) pages.push(i)

  if (end < total - 1) pages.push('…')

  if (total > 1) pages.push(total)

  return pages
}