'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { selectPlan } from '@/app/actions/plans'

interface Props {
  planId: string
  planName: string
  variant?: 'primary' | 'secondary'
  className?: string
  currentPlan?: string
}

export function SelectPlanButton({
  planId,
  planName,
  variant = 'primary',
  className = '',
  currentPlan,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const isCurrent = currentPlan === planId

  const handleClick = () => {
    startTransition(async () => {
      const result = await selectPlan(planId)
      if (result.success) {
        router.push('/upload-listing')
      } else {
        setError(result.error || 'Gabim')
      }
    })
  }

  const baseClasses =
    'w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition disabled:opacity-50'

  const variantClasses = {
    primary: 'bg-[#6B4C3B] text-white hover:bg-[#4A342A]',
    secondary: 'bg-[#F3E9E0] text-[#6B4C3B] hover:bg-white',
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Duke aktivizuar...
          </>
        ) : isCurrent ? (
          <>
            <Check className="h-4 w-4" />
            Plani aktual — Vazhdo
          </>
        ) : (
          `Zgjidh ${planName}`
        )}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}