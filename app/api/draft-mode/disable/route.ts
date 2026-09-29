import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const draft = await draftMode()
  draft.disable()

  return NextResponse.redirect(
    new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000')
  )
}