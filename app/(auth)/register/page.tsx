import RegisterForm from '@/components/auth/RegisterForm'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const session = await auth()
  const params = await searchParams
  const callbackUrl = params.callbackUrl || '/'

  // Nëse user është i loguar, ridrejto në callbackUrl
  if (session?.user?.id) {
    redirect(callbackUrl)
  }

  return <RegisterForm callbackUrl={callbackUrl} />
}