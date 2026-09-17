'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitProperty } from '@/app/actions/properties'
import { ImageUploader } from './ImageUploader'
import { MapPicker } from './MapPicker'
import { AIDescriptionHelper } from './AIDescriptionHelper'

interface UploadedImage {
  assetId: string
  url: string
}

export function PropertySubmitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [images, setImages] = useState<UploadedImage[]>([])
  const [coordinates, setCoordinates] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    // Validim client-side
    if (images.length < 3) {
      setError('Duhet të ngarkoni së paku 3 imazhe')
      setLoading(false)
      return
    }

    if (!coordinates) {
      setError('Zgjidh lokacionin në hartë')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images.map((img) => img.assetId)))
    formData.set('latitude', String(coordinates.lat))
    formData.set('longitude', String(coordinates.lng))
    formData.delete('features')
    features.forEach((f) => formData.append('features', f))

    const result = await submitProperty(formData)

    if (result.success) {
      router.push('/account/listings')
    } else {
      setError(result.error || 'Gabim')
      if (result.details) {
        setFieldErrors(result.details)
      }
    }
    setLoading(false)
  }

  const addFeature = () => {
    const trimmed = featureInput.trim()
    if (trimmed && !features.includes(trimmed) && features.length < 20) {
      setFeatures([...features, trimmed])
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════
          SEKSIONI 1: INFORMACIONET BAZË
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Informacionet Bazë</h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titulli *
          </label>
          <input
            type="text"
            name="title"
            required
            minLength={10}
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="P.sh. Apartament Modern 3+1 në Qendër"
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.title[0]}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Minimumi 10 karaktere, maksimumi 100
          </p>
        </div>

        {/* AI Description Helper */}
        <AIDescriptionHelper
          onGenerate={(description) => {
            const textarea = document.querySelector(
              'textarea[name="description"]'
            ) as HTMLTextAreaElement
            if (textarea) textarea.value = description
          }}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Përshkrimi *
          </label>
          <textarea
            name="description"
            required
            minLength={50}
            maxLength={2000}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="Përshkruani pronën në detaje. Përfshini veçoritë kryesore, gjendjen, dhe çfarë e bën atë unike."
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.description[0]}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Minimumi 50 karaktere, maksimumi 2000
          </p>
        </div>

        {/* Price & Listing Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çmimi (€) *
            </label>
            <input
              type="number"
              name="price"
              required
              min={100}
              max={10000000}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
            {fieldErrors.price && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.price[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lloji i listimit *
            </label>
            <select
              name="listingType"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              <option value="">Zgjidh...</option>
              <option value="sale">Për Shitje</option>
              <option value="rent">Me Qira</option>
            </select>
            {fieldErrors.listingType && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.listingType[0]}
              </p>
            )}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipi i pronës *
          </label>
          <select
            name="propertyType"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          >
            <option value="">Zgjidh...</option>
            <option value="apartment">Apartament</option>
            <option value="house">Shtëpi</option>
            <option value="villa">Vilë</option>
            <option value="land">Tokë</option>
            <option value="commercial">Komerciale</option>
          </select>
          {fieldErrors.propertyType && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.propertyType[0]}
            </p>
          )}
        </div>

        {/* Bedrooms, Bathrooms, Area */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dhoma
            </label>
            <input
              type="number"
              name="bedrooms"
              min={0}
              max={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banjo
            </label>
            <input
              type="number"
              name="bathrooms"
              min={0}
              max={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sipërfaqja (m²)
            </label>
            <input
              type="number"
              name="area"
              min={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SEKSIONI 2: LOKACIONI ME HARTË
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Lokacioni</h2>

        {/* Location & City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa *
            </label>
            <input
              type="text"
              name="location"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
              placeholder="Rr. Nëna Terezë, Nr. 45"
            />
            {fieldErrors.location && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.location[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qyteti *
            </label>
            <input
              type="text"
              name="city"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
              placeholder="Prishtina"
            />
            {fieldErrors.city && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.city[0]}</p>
            )}
          </div>
        </div>

        {/* Map Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zgjidh lokacionin në hartë *
          </label>
          <MapPicker onLocationSelect={setCoordinates} />
          {coordinates && (
            <div className="mt-2 text-sm text-gray-600">
              📍 Lat: {coordinates.lat.toFixed(6)}, Lng:{' '}
              {coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SEKSIONI 3: IMAZHET
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Imazhet</h2>

        <ImageUploader onUpload={setImages} />

        {fieldErrors.images && (
          <p className="text-red-500 text-sm">{fieldErrors.images[0]}</p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SEKSIONI 4: VEÇORITË
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-black">Veçoritë</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFeature()
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="P.sh. Pishinë, Parkim, Kopsht..."
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-6 py-3 bg-[#6B4C3B] text-white rounded-lg hover:bg-[#4A342A]"
          >
            Shto
          </button>
        </div>

        {features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-[#F3E9E0] text-[#6B4C3B] rounded-full text-sm flex items-center gap-2"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-[#6B4C3B] hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SEKSIONI 5: KONTAKTI
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Kontakti</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefoni *
            </label>
            <input
              type="tel"
              name="contactPhone"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
              placeholder="+383 44 123 456"
            />
            {fieldErrors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.contactPhone[0]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
            {fieldErrors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.contactEmail[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ERROR & SUBMIT
      ═══════════════════════════════════════════════════════════ */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] disabled:opacity-50 text-lg"
      >
        {loading ? 'Duke dërguar...' : 'Dërgo për Review'}
      </button>
    </form>
  )
}