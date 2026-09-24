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

  return (
    <ResetPasswordForm token={params.token} />
  )
}