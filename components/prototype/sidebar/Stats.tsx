import { HERO_STATS } from '@/lib/constants'

export function Stats() {
  return (
    <div className="mt-12 border-t border-[#E5D5C5] pt-8">
      <div className="grid grid-cols-3 gap-4">
        {HERO_STATS.map(({ value, label }) => (
          <div key={label}>
            <p className="text-2xl font-light text-black">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#6B4C3B]/60">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}