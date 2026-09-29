'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { enableVisualEditing } from '@sanity/visual-editing'

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function VisualEditingWrapper() {
  const router = useRouter()

  useEffect(() => {
    const disable = enableVisualEditing({
      // ─── HISTORI: sinkronizim me router-in e Next.js ───────────
      history: {
        subscribe: (navigate) => {
          const handler = () =>
            navigate({ type: 'pop', url: location.href })

          addEventListener('popstate', handler)
          return () => removeEventListener('popstate', handler)
        },

        update: (update) => {
          if (update.type === 'push') {
            router.push(update.url)
          } else if (update.type === 'replace') {
            router.replace(update.url)
          } else if (update.type === 'pop') {
            history.back()
          }
        },
      },

      // ─── RIFRESKIM AUTOMATIK ──────────────────────────────────
      refresh: (payload) => {
        if (payload.source === 'mutation') {
          router.refresh()
          return Promise.resolve()
        }

        if (payload.source === 'manual') {
          router.refresh()
          return Promise.resolve()
        }

        return false
      },
    })

    return () => disable()
  }, [router])

  return null
}