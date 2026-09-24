'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, AlertCircle, Loader2 } from 'lucide-react'
import { becomeSeller } from '@/lib/types/seller'

export function BecomeSellerForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await becomeSeller(formData)

    if (result.success) {
      // ⭐ RIDREJTO sipas redirectTo
      router.push(result.redirectTo || '/sell')
      router.refresh()
      return
    }

    setError(result.error || 'Gabim')
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E8DDD2] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-5">
        {/* INFO BOX */}
        <div className="rounded-xl bg-[#F3E9E0] p-4">
          <p className="text-sm text-[#6B4C3B]">
            Plotëso të dhënat për të filluar listimin e pronave. Duke u bërë
            seller, ju merrni përgjegjësinë për saktësinë e të dhënave që
            publikoni.
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B4C3B]" />
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-[#E8DDD2] bg-[#F7F3EE]/30 pl-11 pr-4 py-3 text-black outline-none transition focus:border-[#6B4C3B] focus:bg-white"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* PHONE */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-black">
            Numri i telefonit <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B4C3B]" />
            <input
              type="tel"
              name="phone"
              required
              minLength={6}
              maxLength={20}
              className="w-full rounded-lg border border-[#E8DDD2] bg-[#F7F3EE]/30 pl-11 pr-4 py-3 text-black outline-none transition focus:border-[#6B4C3B] focus:bg-white"
              placeholder="+383 44 123 456"
            />
          </div>
          <p className="mt-1.5 text-xs text-[#6B4C3B]/60">
            P.sh. +383 44 123 456 ose 044123456
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] py-4 text-sm font-semibold text-white transition hover:bg-[#4A342A] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Duke procesuar...
            </>
          ) : (
            'Bëhu Seller'
          )}
        </button>
      </div>
    </form>
  )
}