import type { LucideIcon } from 'lucide-react'
import { Building2, Calendar, Car, Check, Compass, Home, Layers, Shield, Sofa, Sun, Thermometer, Trees, Waves, Wifi, Zap } from 'lucide-react'
import { CONDITION_LABELS, FURNISHED_LABELS, ORIENTATION_LABELS, PROPERTY_TYPE_LABELS } from './property-labels'

export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
]

export interface PropertyFeatureItem { icon: LucideIcon; label: string; value?: string }
export interface PropertyAmenityItem { icon: LucideIcon; label: string }

export function getDisplayImages(images: Array<{ asset?: { url?: string | null } | null }> | null | undefined, primaryImageUrl?: string | null): string[] {
  let displayImages = images?.flatMap((image) => image.asset?.url ? [image.asset.url] : []) ?? []
  if (!displayImages.length && primaryImageUrl) displayImages = [primaryImageUrl]
  if (!displayImages.length) displayImages = [...FALLBACK_IMAGES]
  while (displayImages.length < 3) displayImages.push(FALLBACK_IMAGES[displayImages.length % FALLBACK_IMAGES.length])
  return displayImages
}

type DisplayProperty = {
  property_type?: string | null; floor?: number | null; total_floors?: number | null; year_built?: number | null; renovation_year?: number | null
  condition?: string | null; orientation?: string | null; furnished?: string | null; energy_class?: string | null; balconies?: number | null
  has_elevator?: boolean | null; has_parking?: boolean | null; has_garden?: boolean | null; has_pool?: boolean | null
  has_air_conditioning?: boolean | null; has_heating?: boolean | null; has_security?: boolean | null; has_internet?: boolean | null
}

export function getPropertyFeatures(property: DisplayProperty): PropertyFeatureItem[] {
  const items: PropertyFeatureItem[] = []
  if (property.property_type) items.push({ icon: Building2, label: 'Tipi i pronës', value: PROPERTY_TYPE_LABELS[property.property_type] || property.property_type })
  if (property.floor !== null && property.floor !== undefined) items.push({ icon: Layers, label: 'Kati', value: `${property.floor}${property.total_floors ? ` / ${property.total_floors}` : ''}` })
  if (property.year_built) items.push({ icon: Calendar, label: 'Viti i ndërtimit', value: String(property.year_built) })
  if (property.renovation_year) items.push({ icon: Calendar, label: 'Viti i rinovimit', value: String(property.renovation_year) })
  if (property.condition) items.push({ icon: Check, label: 'Gjendja', value: CONDITION_LABELS[property.condition] || property.condition })
  if (property.orientation) items.push({ icon: Compass, label: 'Orientimi', value: ORIENTATION_LABELS[property.orientation] || property.orientation })
  if (property.furnished) items.push({ icon: Sofa, label: 'Mobilimi', value: FURNISHED_LABELS[property.furnished] || property.furnished })
  if (property.energy_class) items.push({ icon: Zap, label: 'Klasa energjetike', value: property.energy_class })
  if (property.balconies) items.push({ icon: Home, label: 'Ballkone', value: String(property.balconies) })
  return items
}

export function getPropertyAmenities(property: DisplayProperty): PropertyAmenityItem[] {
  const items: PropertyAmenityItem[] = []
  if (property.has_elevator) items.push({ icon: Layers, label: 'Ashensor' })
  if (property.has_parking) items.push({ icon: Car, label: 'Parking' })
  if (property.has_garden) items.push({ icon: Trees, label: 'Kopsht' })
  if (property.has_pool) items.push({ icon: Waves, label: 'Pishinë' })
  if (property.has_air_conditioning) items.push({ icon: Thermometer, label: 'Ajër i kondicionuar' })
  if (property.has_heating) items.push({ icon: Sun, label: 'Ngrohje qendrore' })
  if (property.has_security) items.push({ icon: Shield, label: 'Sistem sigurie' })
  if (property.has_internet) items.push({ icon: Wifi, label: 'Internet me fibër' })
  return items
}
