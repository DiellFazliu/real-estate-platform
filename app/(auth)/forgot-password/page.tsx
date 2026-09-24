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