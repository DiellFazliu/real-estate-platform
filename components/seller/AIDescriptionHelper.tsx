'use client'

import { useState } from 'react'

interface AIDescriptionHelperProps {
  onGenerate: (description: string) => void
}

export function AIDescriptionHelper({ onGenerate }: AIDescriptionHelperProps) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [city, setCity] = useState('')
  const [features, setFeatures] = useState('')

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      alert('Shkruani disa fjalë kyçe për përshkrimin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          propertyType,
          bedrooms,
          city,
          features,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onGenerate(data.description)
        setShowForm(false)
      } else {
        alert(data.error || 'Gabim gjatë gjenerimit')
      }
    } catch (error) {
      alert('Gabim gjatë gjenerimit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-[#E5D5C5] rounded-lg p-4 bg-[#F7F3EE]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B4C3B]">
            ✨ Ndihmës me AI për përshkrimin
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Lejo AI të gjenerojë një përshkrim profesional
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm bg-[#6B4C3B] text-white rounded-lg hover:bg-[#4A342A]"
        >
          {showForm ? 'Anulo' : 'Provo'}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fjalë kyçe *
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="P.sh. i rinovuar, me dritë natyrale, qendër..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipi
              </label>
              <input
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Apartament"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dhoma
              </label>
              <input
                type="text"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Qyteti
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Prishtina"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Veçoritë
            </label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Pishinë, Parkim, Kopsht"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2 bg-[#6B4C3B] text-white rounded-lg text-sm hover:bg-[#4A342A] disabled:opacity-50"
          >
            {loading ? 'Duke gjeneruar...' : 'Gjenero Përshkrimin'}
          </button>
        </div>
      )}
    </div>
  )
}