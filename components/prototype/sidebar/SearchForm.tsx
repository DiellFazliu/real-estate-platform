'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from '@/components/icons'
import { SIDEBAR_TEXT } from '@/lib/constants'

export function SearchForm() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()

    if (query) {
      router.push(`/properties?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/properties')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <label
        htmlFor="property-search"
        className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#6B4C3B]"
      >
        {SIDEBAR_TEXT.searchLabel}
      </label>

      <div className="flex items-center border-b-2 border-[#E5D5C5] transition-colors focus-within:border-[#6B4C3B]">
        <input
          id="property-search"
          type="search"
          placeholder={SIDEBAR_TEXT.searchPlaceholder}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full bg-transparent py-3 text-sm text-black placeholder-[#6B4C3B]/40 focus:outline-none"
        />

        <button
          type="submit"
          className="ml-2 p-2 text-[#6B4C3B]/50 transition-colors hover:text-[#6B4C3B]"
          aria-label="Search properties"
        >
          <SearchIcon />
        </button>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-[#6B4C3B] py-3.5 text-sm font-medium text-[#F7F3EE] transition-colors hover:bg-[#4A342A]"
      >
        {SIDEBAR_TEXT.searchButton}
      </button>
    </form>
  )
}