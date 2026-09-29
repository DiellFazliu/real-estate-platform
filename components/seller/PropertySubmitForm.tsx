'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

import { submitProperty, updateProperty } from '@/app/actions/properties'
import type { SellerPlan } from '@/lib/data/seller-plans'

import type {
  UploadedImage,
  PropertyFormInitialData,
} from './property-form/types'
import { BasicInfoSection } from './property-form/BasicInfoSection'
import { CharacteristicsSection } from './property-form/CharacteristicsSection'
import { FeaturesSection } from './property-form/FeaturesSection'
import { LocationSection } from './property-form/LocationSection'
import { ImagesSection } from './property-form/ImagesSection'
import { ContactSection } from './property-form/ContactSection'
import { PlanBanner, EditBanner } from './property-form/Banners'

// Re-export për backwards compatibility
export type { PropertyFormInitialData }

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

  // ─── State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [images, setImages] = useState<UploadedImage[]>(initialData?.images ?? [])
  const [coordinates, setCoordinates] = useState<{
    lat: number
    lng: number
  } | null>(
    initialData?.latitude != null && initialData?.longitude != null
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  )
  const [features, setFeatures] = useState<string[]>(initialData?.features ?? [])
  const [featureInput, setFeatureInput] = useState('')

  const [selectedCity, setSelectedCity] = useState(initialData?.city ?? '')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    initialData?.neighborhood ?? ''
  )

  // ⭐ Tipi i pronës — kontrollon cilat fusha shfaqen
  const [propertyType, setPropertyType] = useState(
    initialData?.propertyType ?? ''
  )

  // ─── Derived ────────────────────────────────────────────────
  const maxListings = plan?.limits.maxActiveListings ?? -1
  const maxImages = plan?.limits.maxImagesPerListing ?? -1

  const isListingLimitReached =
    !isEdit && maxListings !== -1 && currentListingCount >= maxListings

  // ─── Handlers ───────────────────────────────────────────────
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city)
    setSelectedNeighborhood('')
  }, [])

  const addFeature = useCallback(() => {
    const trimmed = featureInput.trim()
    if (trimmed && !features.includes(trimmed) && features.length < 20) {
      setFeatures((prev) => [...prev, trimmed])
      setFeatureInput('')
    }
  }, [featureInput, features])

  const removeFeature = useCallback((index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // ─── Validation ─────────────────────────────────────────────
  const validate = (): string | null => {
    if (isListingLimitReached) {
      return `Ke arritur limitin e planit ${plan?.name} (${maxListings} listime aktive). Përmirëso planin për të vazhduar.`
    }
    if (images.length < 3) {
      return 'Duhet të ngarkoni së paku 3 imazhe'
    }
    if (maxImages !== -1 && images.length > maxImages) {
      return `Plani ${plan?.name} lejon maksimumi ${maxImages} imazhe. Ke zgjedhur ${images.length}.`
    }
    if (!coordinates) {
      return 'Zgjidh lokacionin në hartë'
    }
    if (!selectedCity.trim()) {
      return 'Zgjidh qytetin'
    }
    if (!selectedNeighborhood.trim()) {
      return 'Zgjidh lagjen'
    }
    if (!propertyType.trim()) {
      return 'Zgjidh tipin e pronës'
    }
    return null
  }

  // ─── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Override fields që kontrollohen nga React state
      formData.set('images', JSON.stringify(images.map((img) => img.assetId)))
      formData.set('latitude', String(coordinates!.lat))
      formData.set('longitude', String(coordinates!.lng))
      formData.set('city', selectedCity)
      formData.set('neighborhood', selectedNeighborhood)
      formData.set('propertyType', propertyType)

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
        return
      }

      setError(result.error || 'Gabim gjatë ruajtjes')
      if ('details' in result && result.details) {
        setFieldErrors(result.details)
      }
    } catch (err) {
      console.error(err)
      setError('Gabim i papritur. Provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!isEdit && (
        <Link
          href="/sell-for-yourself#plans"
          className="w-full py-4 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] text-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Zgjidh planin që të përshtatet
        </Link>
      )}

      {!isEdit && plan && (
        <PlanBanner
          plan={plan}
          maxListings={maxListings}
          maxImages={maxImages}
          currentListingCount={currentListingCount}
          isListingLimitReached={isListingLimitReached}
        />
      )}

      {isEdit && <EditBanner />}

      <BasicInfoSection
        initialData={initialData}
        fieldErrors={fieldErrors}
        onPropertyTypeChange={setPropertyType}
      />

      <CharacteristicsSection
        initialData={initialData}
        propertyType={propertyType}
      />

      <FeaturesSection
        initialData={initialData}
        features={features}
        featureInput={featureInput}
        onFeatureInputChange={setFeatureInput}
        onAddFeature={addFeature}
        onRemoveFeature={removeFeature}
      />

      <LocationSection
        initialData={initialData}
        fieldErrors={fieldErrors}
        selectedCity={selectedCity}
        selectedNeighborhood={selectedNeighborhood}
        coordinates={coordinates}
        onCityChange={handleCityChange}
        onNeighborhoodChange={setSelectedNeighborhood}
        onCoordinatesChange={setCoordinates}
      />

      <ImagesSection
        initialData={initialData}
        maxImages={maxImages}
        fieldErrors={fieldErrors}
        onUpload={setImages}
      />

      <ContactSection initialData={initialData} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || isListingLimitReached}
        className="w-full py-4 bg-[#6B4C3B] text-white rounded-lg font-semibold hover:bg-[#4A342A] disabled:opacity-50 text-lg transition-colors"
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