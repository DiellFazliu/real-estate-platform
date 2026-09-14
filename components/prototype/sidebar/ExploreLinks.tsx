import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'
import { EXPLORE_LINKS, SIDEBAR_TEXT } from '@/lib/constants'

export function ExploreLinks() {
  return (
    <nav className="mt-12" aria-label="Explore properties">
      <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#6B4C3B]/60">
        {SIDEBAR_TEXT.exploreLabel}
      </p>

      <ul>
        {EXPLORE_LINKS.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center justify-between border-b border-[#E5D5C5] py-3 transition-colors hover:border-[#6B4C3B]"
            >
              <span className="text-sm text-[#6B4C3B] transition-colors group-hover:text-black">
                {label}
              </span>

              <span className="text-[#6B4C3B]/40 transition-all group-hover:translate-x-1 group-hover:text-[#6B4C3B]">
                <ArrowRightIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}