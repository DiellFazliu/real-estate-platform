import { draftMode } from 'next/headers'
import { client } from './client'

export async function getDraftClient() {
  const { isEnabled } = await draftMode()

  if (!isEnabled) {
    return {
      client,
      isDraft: false,
    }
  }

  // ⭐ Në draft mode: pa CDN, me token, me stega
  const draftClient = client.withConfig({
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
    perspective: 'previewDrafts',
    stega: {
      enabled: true,
      studioUrl: '/studio',
    },
  })

  return {
    client: draftClient,
    isDraft: true,
  }
}