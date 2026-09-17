import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { BecomeSellerForm } from '@/components/seller/BecomeSellerForm'

export default async function BecomeSellerPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { is_seller: true, seller_verified: true },
  })

  if (user?.is_seller && user?.seller_verified) {
    redirect('/sell')
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Bëhu Seller</h1>
          <p className="text-[#6B4C3B]/60 mt-2">
            Plotëso të dhënat për të filluar listimin e pronave në platformë
          </p>
        </div>
        <BecomeSellerForm />
      </div>
    </div>
  )
}