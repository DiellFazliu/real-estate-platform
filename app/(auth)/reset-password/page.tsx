// app/(auth)/reset-password/page.tsx — wrapper for the reset form.
// Reads ?token=... from the URL and passes it to the client form.
// Missing token → redirect to /forgot-password so the user can request
// a fresh link instead of seeing a broken form.

import { redirect } from 'next/navigation'

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams

  if (!params.token) {
    redirect('/forgot-password')
  }

  return <ResetPasswordForm token={params.token} />
}