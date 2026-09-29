import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('sanity-preview-secret')
  const slug = searchParams.get('sanity-preview-pathname') || '/'

  if (process.env.NODE_ENV === 'production') {
    if (secret !== process.env.SANITY_PREVIEW_SECRET) {
      return new Response('Invalid preview secret', { status: 401 })
    }
  }

  const draft = await draftMode()
  draft.enable()
  redirect(slug)
}

export async function POST(request: NextRequest) {
  return GET(request)
}