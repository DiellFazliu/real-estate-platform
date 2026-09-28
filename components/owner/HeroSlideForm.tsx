'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSlideImageUpload } from './HeroSlideImageUpload'
import { createHeroSlide, updateHeroSlide } from '@/app/actions/hero-slides'

interface Property {
  id: number
  title: string
  slug: string
}

interface Props {
  properties: Property[]
  initialData?: any
}

export function HeroSlideForm({ properties, initialData }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')

  const isEdit = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!imageUrl) {
      setError('Duhet të ngarkosh një imazh')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('image_url', imageUrl)

    const result = isEdit
      ? await updateHeroSlide(initialData.id, formData)
      : await createHeroSlide(formData)

    if (result.success) {
      router.push('/owner/hero-slides')
      router.refresh()
    } else {
      setError(
        typeof result.error === 'string' ? result.error : 'Gabim gjatë ruajtjes'
      )
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titulli *
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          placeholder="P.sh. Villaron Grand Avenue"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nëntitulli
        </label>
        <input
          type="text"
          name="subtitle"
          defaultValue={initialData?.subtitle}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
        />
      </div>

      {/* Price & Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Çmimi
          </label>
          <input
            type="text"
            name="price"
            defaultValue={initialData?.price}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="P.sh. €250,000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge
          </label>
          <select
            name="badge"
            defaultValue={initialData?.badge || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          >
            <option value="">Pa badge</option>
            <option value="Featured">Eksluzive</option>
            <option value="Premium">Premium</option>
            <option value="Luxury">Luks</option>
            <option value="New">E re</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Përshkrimi
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialData?.description}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imazhi *
        </label>
        <HeroSlideImageUpload
          onUpload={setImageUrl}
          initialUrl={initialData?.image_url}
        />
      </div>

      {/* Property */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prona (opsionale)
        </label>
        <select
          name="property_id"
          defaultValue={initialData?.property_id || ''}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
        >
          <option value="">Pa pronë</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Custom URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ose URL Custom
        </label>
        <input
          type="url"
          name="custom_url"
          defaultValue={initialData?.custom_url}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          placeholder="https://..."
        />
      </div>

      {/* Order & Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Radha
          </label>
          <input
            type="number"
            name="order"
            min={0}
            defaultValue={initialData?.order || 0}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initialData?.is_active !== false}
              className="w-5 h-5 accent-[#6B4C3B]"
            />
            <span className="text-sm text-gray-700">Aktiv</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !imageUrl}
        className="w-full py-3 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] disabled:opacity-50"
      >
        {loading ? 'Duke ruajtur...' : isEdit ? 'Përditëso' : 'Krijo Slide'}
      </button>
    </form>
  )
}