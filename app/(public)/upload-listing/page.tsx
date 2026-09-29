// app/(public)/upload-listing/page.tsx — new-listing flow. Three branches:
//   1. Not a seller yet        → BecomeSellerForm
//   2. Seller, not verified    → "application pending" message
//   3. Verified seller         → PropertySubmitForm
//
// The page handles all three states so links can point here for any
// logged-in user without pre-checks.

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertySubmitForm } from '@/components/seller/PropertySubmitForm'
import { BecomeSellerForm } from '@/components/seller/BecomeSellerForm'
import { getPlan } from '@/lib/data/seller-plans'

export default async function UploadListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/upload-listing')

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    redirect('/login?callbackUrl=/upload-listing')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      is_seller: true,
      seller_verified: true,
      plan: true,
    },
  })

  // Case 1 — not a seller yet.
  if (!user?.is_seller) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] pt-20">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-black">Bëhu Seller</h1>
            <p className="mt-2 text-[#6B4C3B]/60">
              Plotëso të dhënat për të filluar listimin e pronave në platformë
            </p>
          </div>
          <BecomeSellerForm />
        </div>
      </div>
    )
  }

  // Case 2 — applied, awaiting verification.
  if (!user?.seller_verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EE] px-4 pt-20">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9E0]">
            <span className="text-3xl">⏳</span>
          </div>

          <h1 className="text-2xl font-bold text-black">
            Aplikimi juaj është në pritje
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B4C3B]/60">
            Ekipi ynë po e shqyrton aplikimin tuaj si seller. Do të
            njoftoheni me email sapo të aprovohet. Zakonisht zgjat 24-48 orë.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A342A]"
          >
            Kthehu në faqen kryesore
          </Link>
        </div>
      </div>
    )
  }

  // Case 3 — verified seller: show the submit form.
  const currentListingCount = await prisma.property.count({
    where: {
      listed_by_id: userId,
      status: { in: ['DRAFT', 'PUBLISHED'] },
      review_status: { in: ['PENDING_REVIEW', 'APPROVED'] },
    },
  })

  const plan = getPlan(user.plan)

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Listo Pronën Tënde
          </h1>
          <p className="mt-2 text-[#6B4C3B]/60">
            Plotëso formularin dhe dërgoje për review. Do të aprovohet brenda
            24-48 orëve.
          </p>
        </div>
        <PropertySubmitForm
          plan={plan}
          currentListingCount={currentListingCount}
        />
      </div>
    </div>
  )
}