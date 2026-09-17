'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { becomeSeller } from '@/app/actions/seller'

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
      router.push('/sell')
      router.refresh()
    } else {
      setError(result.error || 'Gabim')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telefoni *
        </label>
        <input
          type="tel"
          name="phone"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          placeholder="+383 44 123 456"
        />
      </div>

      <div className="p-4 bg-[#F3E9E0] rounded-lg">
        <p className="text-sm text-[#6B4C3B]">
          <strong>Shënim:</strong> Duke u bërë seller, ju merrni përgjegjësinë për
          saktësinë e të dhënave që publikoni. Çdo listim kalon në review nga pronari
          i platformës.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] disabled:opacity-50"
      >
        {loading ? 'Duke procesuar...' : 'Bëhu Seller'}
      </button>
    </form>
  )
}