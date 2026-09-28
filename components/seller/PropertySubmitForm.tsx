'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { submitProperty, updateProperty } from '@/app/actions/properties'
import { ImageUploader } from './ImageUploader'
import { MapPicker } from './MapPickerWrapper'
import { AIDescriptionHelper } from './AIDescriptionHelper'
import { CITIES, getNeighborhoods } from '@/lib/data/locations'
import type { SellerPlan } from '@/lib/data/seller-plans'

interface UploadedImage {
  assetId: string
  url: string
}

export interface PropertyFormInitialData {
  id: number
  title: string
  description: string
  price: number
  listingType: string
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  balconies: number | null
  floor: number | null
  totalFloors: number | null
  yearBuilt: number | null
  renovationYear: number | null
  condition: string | null
  orientation: string | null
  furnished: string | null
  energyClass: string | null
  location: string | null
  city: string | null
  neighborhood: string | null
  postalCode: string | null
  distanceFromCenter: number | null
  latitude: number | null
  longitude: number | null
  hasElevator: boolean
  hasParking: boolean
  hasGarden: boolean
  hasPool: boolean
  hasAirConditioning: boolean
  hasHeating: boolean
  hasSecurity: boolean
  hasInternet: boolean
  features: string[]
  images: UploadedImage[]
  contactPhone: string
  contactEmail: string
}

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartament' },
  { value: 'house', label: 'Shtëpi' },
  { value: 'villa', label: 'Vilë' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Truall' },
  { value: 'commercial', label: 'Komerciale' },
  { value: 'office', label: 'Zyrë' },
]

const BOOLEAN_FEATURES = [
  { name: 'hasElevator', label: 'Ashensor' },
  { name: 'hasParking', label: 'Parkim' },
  { name: 'hasGarden', label: 'Kopsht' },
  { name: 'hasPool', label: 'Pishinë' },
  { name: 'hasAirConditioning', label: 'Ajër i Kondicionuar' },
  { name: 'hasHeating', label: 'Ngrohje' },
  { name: 'hasSecurity', label: 'Siguri' },
  { name: 'hasInternet', label: 'Internet' },
]

const CONDITION_OPTIONS = [
  { value: 'new', label: 'I ri' },
  { value: 'excellent', label: 'Shumë i mirë' },
  { value: 'good', label: 'I mirë' },
  { value: 'needs_renovation', label: 'Kërkon rinovim' },
  { value: 'under_construction', label: 'Në ndërtim' },
]

const ORIENTATION_OPTIONS = [
  { value: '', label: 'Zgjidh...' },
  { value: 'north', label: 'Veri' },
  { value: 'south', label: 'Jug' },
  { value: 'east', label: 'Lindje' },
  { value: 'west', label: 'Perëndim' },
]

const FURNISHED_OPTIONS = [
  { value: 'unfurnished', label: 'Pa mobilje' },
  { value: 'semi_furnished', label: 'Gjysmë i mobiluar' },
  { value: 'fully_furnished', label: 'I mobiluar plotësisht' },
]

const ENERGY_OPTIONS = ['', 'A+', 'A', 'B', 'C', 'D', 'E', 'F']

interface Props {
  plan?: SellerPlan
  currentListingCount?: number
  initialData?: PropertyFormInitialData
}

export function PropertySubmitForm({
  plan,
  currentListingCount = 0,
  initialData,
}: Props) {
  const isEdit = Boolean(initialData)
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [images, setImages] = useState<UploadedImage[]>(
    initialData?.images ?? [],
  )
  const [coordinates, setCoordinates] = useState<{
    lat: number
    lng: number
  } | null>(
    initialData?.latitude != null && initialData?.longitude != null
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  )
  const [features, setFeatures] = useState<string[]>(
    initialData?.features ?? [],
  )
  const [featureInput, setFeatureInput] = useState('')

  const [selectedCity, setSelectedCity] = useState(initialData?.city ?? '')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    initialData?.neighborhood ?? '',
  )

  const availableNeighborhoods = useMemo(
    () => (selectedCity ? getNeighborhoods(selectedCity) : []),
    [selectedCity],
  )

  // Plan limits — only enforced on create, not on edit
  const maxListings = plan?.limits.maxActiveListings ?? -1
  const maxImages = plan?.limits.maxImagesPerListing ?? -1

  const isListingLimitReached =
    !isEdit && maxListings !== -1 && currentListingCount >= maxListings

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value)
    setSelectedNeighborhood('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    if (isListingLimitReached) {
      setError(
        `Ke arritur limitin e planit ${plan?.name} (${maxListings} listime aktive). Përmirëso planin për të vazhduar.`,
      )
      setLoading(false)
      return
    }

    if (images.length < 3) {
      setError('Duhet të ngarkoni së paku 3 imazhe')
      setLoading(false)
      return
    }

    if (maxImages !== -1 && images.length > maxImages) {
      setError(
        `Plani ${plan?.name} lejon maksimumi ${maxImages} imazhe. Ke zgjedhur ${images.length}.`,
      )
      setLoading(false)
      return
    }

    if (!coordinates) {
      setError('Zgjidh lokacionin në hartë')
      setLoading(false)
      return
    }

    if (!selectedCity) {
      setError('Zgjidh qytetin')
      setLoading(false)
      return
    }

    if (!selectedNeighborhood) {
      setError('Zgjidh lagjen')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images.map((img) => img.assetId)))
    formData.set('latitude', String(coordinates.lat))
    formData.set('longitude', String(coordinates.lng))
    formData.set('city', selectedCity)
    formData.set('neighborhood', selectedNeighborhood)
    formData.delete('features')
    features.forEach((f) => formData.append('features', f))

    if (isEdit && initialData) {
      formData.set('propertyId', String(initialData.id))
    }

    const result = isEdit
      ? await updateProperty(formData)
      : await submitProperty(formData)

    if (result.success) {
      router.push('/account/listings')
      router.refresh()
    } else {
      setError(result.error || 'Gabim')
      if ('details' in result && result.details) {
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
      {/* BACK BUTTON (only on create) */}
      {!isEdit && (
        <Link
          href="/sell-for-yourself#plans"
          className="w-full py-4 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] text-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Zgjidh planin që të përshtatet
        </Link>
      )}

      {/* PLAN BANNER (only on create) */}
      {!isEdit && plan && (
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
                  ⚠️ Ke arritur limitin e listimeve. Përmirëso planin për të
                  vazhduar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT BANNER (only on edit) */}
      {isEdit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Duke edituar listimin
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Pas ruajtjes, prona do të ridërgohet automatikisht për
                review nga ekipi i moderimit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEKSIONI 1: INFORMACIONET BAZË */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Informacionet Bazë</h2>

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
            defaultValue={initialData?.title ?? ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="P.sh. Apartament Modern 3+1 në Qendër"
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.title[0]}</p>
          )}
        </div>

        <AIDescriptionHelper
          onGenerate={(description) => {
            const textarea = document.querySelector(
              'textarea[name="description"]',
            ) as HTMLTextAreaElement
            if (textarea) textarea.value = description
          }}
        />

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
            defaultValue={initialData?.description ?? ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="Përshkruani pronën në detaje..."
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.description[0]}
            </p>
          )}
        </div>

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
              defaultValue={initialData?.price ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lloji i listimit *
            </label>
            <select
              name="listingType"
              required
              defaultValue={initialData?.listingType ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              <option value="">Zgjidh...</option>
              <option value="sale">Për Shitje</option>
              <option value="rent">Me Qira</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipi i pronës *
          </label>
          <select
            name="propertyType"
            required
            defaultValue={initialData?.propertyType ?? ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
          >
            <option value="">Zgjidh...</option>
            {PROPERTY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEKSIONI 2: KARAKTERISTIKAT */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Karakteristikat</h2>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dhoma
            </label>
            <input
              type="number"
              name="bedrooms"
              min={0}
              max={20}
              defaultValue={initialData?.bedrooms ?? ''}
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
              defaultValue={initialData?.bathrooms ?? ''}
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
              defaultValue={initialData?.area ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ballkone
            </label>
            <input
              type="number"
              name="balconies"
              min={0}
              max={10}
              defaultValue={initialData?.balconies ?? 0}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kati
            </label>
            <input
              type="number"
              name="floor"
              min={-2}
              max={50}
              defaultValue={initialData?.floor ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kati Total
            </label>
            <input
              type="number"
              name="totalFloors"
              min={1}
              max={100}
              defaultValue={initialData?.totalFloors ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Viti i Ndërtimit
            </label>
            <input
              type="number"
              name="yearBuilt"
              min={1900}
              max={2030}
              defaultValue={initialData?.yearBuilt ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Viti i Rinovimit
            </label>
            <input
              type="number"
              name="renovationYear"
              min={1900}
              max={2030}
              defaultValue={initialData?.renovationYear ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gjendja
            </label>
            <select
              name="condition"
              defaultValue={initialData?.condition ?? 'good'}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientimi
            </label>
            <select
              name="orientation"
              defaultValue={initialData?.orientation ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              {ORIENTATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobilimi
            </label>
            <select
              name="furnished"
              defaultValue={initialData?.furnished ?? 'unfurnished'}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              {FURNISHED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klasa Energjetike
            </label>
            <select
              name="energyClass"
              defaultValue={initialData?.energyClass ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              {ENERGY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v || 'Zgjidh...'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SEKSIONI 3: VEÇORITË */}
      <div className="bg-white rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-black">Veçoritë</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BOOLEAN_FEATURES.map((feature) => (
            <label
              key={feature.name}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#6B4C3B] cursor-pointer transition"
            >
              <input
                type="checkbox"
                name={feature.name}
                defaultChecked={
                  initialData
                    ? Boolean(
                        initialData[
                          feature.name as keyof PropertyFormInitialData
                        ],
                      )
                    : false
                }
                className="w-5 h-5 accent-[#6B4C3B]"
              />
              <span className="text-sm text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
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
            placeholder="Veçori shtesë (p.sh. Smart Home, Fireplace)"
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

      {/* SEKSIONI 4: LOKACIONI */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">Lokacioni</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresa *
          </label>
          <input
            type="text"
            name="location"
            required
            defaultValue={initialData?.location ?? ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            placeholder="Rr. Nëna Terezë, Nr. 45"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qyteti *
            </label>
            <select
              name="city"
              required
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            >
              <option value="">Zgjidh qytetin...</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lagjja *
            </label>
            <select
              name="neighborhood"
              required
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              disabled={!selectedCity}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedCity
                  ? 'Zgjidh lagjen...'
                  : 'Zgjidh qytetin fillimisht'}
              </option>
              {availableNeighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kodi Postar
            </label>
            <input
              type="text"
              name="postalCode"
              defaultValue={initialData?.postalCode ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distanca nga Qendra (km)
            </label>
            <input
              type="number"
              name="distanceFromCenter"
              min={0}
              step={0.1}
              defaultValue={initialData?.distanceFromCenter ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zgjidh lokacionin në hartë *
          </label>
          <MapPicker
            initialLat={coordinates?.lat}
            initialLng={coordinates?.lng}
            onLocationSelect={setCoordinates}
          />
          {coordinates && (
            <div className="mt-2 text-sm text-gray-600">
              📍 Lat: {coordinates.lat.toFixed(6)}, Lng:{' '}
              {coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>
      </div>

      {/* SEKSIONI 5: IMAZHET */}
      <div className="bg-white rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-black">
          Imazhet {maxImages !== -1 && `(maks. ${maxImages})`}
        </h2>

        <ImageUploader
          initialImages={initialData?.images}
          onUpload={setImages}
          maxImages={maxImages === -1 ? undefined : maxImages}
        />

        {fieldErrors.images && (
          <p className="text-red-500 text-sm">{fieldErrors.images[0]}</p>
        )}
      </div>

      {/* SEKSIONI 6: KONTAKTI */}
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
              defaultValue={initialData?.contactPhone ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
              placeholder="+383 44 123 456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              required
              defaultValue={initialData?.contactEmail ?? ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B4C3B]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || isListingLimitReached}
        className="w-full py-4 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] disabled:opacity-50 text-lg"
      >
        {loading
          ? 'Duke dërguar...'
          : isListingLimitReached
            ? 'Limiti i planit u arrit'
            : isEdit
              ? 'Ruaj Ndryshimet dhe Ridërgo për Review'
              : 'Dërgo për Review'}
      </button>
    </form>
  )
}