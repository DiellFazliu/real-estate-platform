// ═══════════════════════════════════════════════════════════════
// BANNERS: PLAN + EDIT
// ═══════════════════════════════════════════════════════════════

import { AlertCircle } from 'lucide-react'
import type { SellerPlan } from '@/lib/data/seller-plans'

interface PlanBannerProps {
  plan: SellerPlan
  maxListings: number
  maxImages: number
  currentListingCount: number
  isListingLimitReached: boolean
}

export function PlanBanner({
  plan,
  maxListings,
  maxImages,
  currentListingCount,
  isListingLimitReached,
}: PlanBannerProps) {
  return (
    <div className="rounded-2xl border border-[#6B4C3B]/15 bg-[#F3E9E0] p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#6B4C3B]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#6B4C3B]">
            Plani aktual: {plan.name}
          </p>
          <p className="mt-1 text-xs text-[#6B4C3B]/70">
            {maxListings === -1
              ? 'Listime të pakufizuara'
              : `${currentListingCount} / ${maxListings} listime aktive`}
            {' · '}
            {maxImages === -1
              ? 'Foto të pakufizuara'
              : `Maksimumi ${maxImages} foto për listim`}
          </p>
          {isListingLimitReached && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              ⚠️ Ke arritur limitin e listimeve. Përmirëso planin për të vazhduar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function EditBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Duke edituar listimin
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Pas ruajtjes, prona do të ridërgohet automatikisht për review nga
            ekipi i moderimit.
          </p>
        </div>
      </div>
    </div>
  )
}