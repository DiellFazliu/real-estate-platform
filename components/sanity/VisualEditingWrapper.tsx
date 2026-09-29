'use client'

// components/sanity/VisualEditingWrapper.tsx — enables Sanity's click-to-edit
// overlay when the app is loaded inside Sanity Studio's Presentation tool.
//
// Wires three things between Sanity and Next.js:
//   • history  — keeps Sanity's preview iframe and the Next.js router in
//                sync (push / replace / pop handled explicitly)
//   • refresh  — re-renders the page after a mutation or a manual refresh
//                from the Studio toolbar
//
// Mounted from app/page.tsx. Renders nothing — pure side-effect component.
//
// Uses next-sanity's re-export instead of @sanity/visual-editing directly


import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { enableVisualEditing } from '@sanity/visual-editing'

export function VisualEditingWrapper() {
  const router = useRouter()

  useEffect(() => {
    const disable = enableVisualEditing({
      // Keep Sanity's preview iframe and the Next router in sync.
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

      // Re-render the page when Sanity mutates content or the editor
      // triggers a manual refresh from the toolbar.
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