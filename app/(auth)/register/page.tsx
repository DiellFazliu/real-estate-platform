// app/(auth)/register/page.tsx — register page wrapper.
// Passes ?callbackUrl through so the form can bounce the user back to
// the page they came from after registration.
//
// The callback is sanitized: only same-origin paths are allowed, so
// ?callbackUrl=https://evil.com can't be used as an open redirect.

import { redirect } from 'next/navigation'

import RegisterForm from '@/components/auth/RegisterForm'
import { auth } from '@/lib/auth/auth'

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

// Accepts only same-origin paths. Rejects absolute URLs and
// protocol-relative URLs (//evil.com) which browsers treat as external.
function safeCallback(raw: string | undefined): string {
  if (!raw) return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//')) return '/'
  return raw
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const session = await auth()
  const params = await searchParams
  const callbackUrl = safeCallback(params.callbackUrl)

  // Already logged in → skip the form, go straight to the target.
  if (session?.user?.id) {
    redirect(callbackUrl)
  }

  return <RegisterForm callbackUrl={callbackUrl} />
}