import LoginForm from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  const params = await searchParams
  const callbackUrl = params.callbackUrl || '/'

  // Nëse user është i loguar, ridrejto në callbackUrl ose home
  if (session?.user?.id) {
    redirect(callbackUrl)
  }

  return <LoginForm callbackUrl={callbackUrl} />
}