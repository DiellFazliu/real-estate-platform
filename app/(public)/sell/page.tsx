import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { PropertySubmitForm } from '@/components/seller/PropertySubmitForm'

export default async function SellPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { is_seller: true, seller_verified: true },
  })

  if (!user?.is_seller || !user?.seller_verified) {
    redirect('/become-seller')
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Listo Pronën Tënde</h1>
          <p className="text-[#6B4C3B]/60 mt-2">
            Plotëso formularin dhe dërgoje për review. Do të aprovohet brenda 24-48 orëve.
          </p>
        </div>
        <PropertySubmitForm />
      </div>
    </div>
  )
}