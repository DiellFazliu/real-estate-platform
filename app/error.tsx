'use client'

import { ErrorLayout } from '@/components/shared/ErrorLayout'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorLayout
      title="Diçka Shkoi Keq"
      description="Ndodhi një gabim i papritur. Provo përsëri ose kthehu në faqen kryesore."
      showRetry={true}
      onRetry={reset}
    />
  )
}