'use client'

export function DraftModeBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-yellow-950 shadow-lg ring-2 ring-yellow-500/50">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 rounded-full bg-yellow-700 animate-pulse" />
        <span>Draft Mode aktiv</span>
        <span className="text-yellow-700">·</span>
        <a
          href="/api/draft-mode/disable"
          className="rounded-full bg-yellow-950 px-3 py-1 text-xs font-bold text-yellow-50 transition hover:bg-black"
        >
          Dil
        </a>
      </div>
    </div>
  )
}