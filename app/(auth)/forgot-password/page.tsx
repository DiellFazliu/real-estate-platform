// app/(auth)/forgot-password/page.tsx — wrapper for the forgot-password
// form. Redirects already-authenticated users to the home page so they
// can't land on a reset flow they don't need.

import { redirect } from 'next/navigation'

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { auth } from '@/lib/auth/auth'

export default async function ForgotPasswordPage() {
  const session = await auth()

  if (session?.user?.id) {
    redirect('/')
  }

  return <ForgotPasswordForm />
}