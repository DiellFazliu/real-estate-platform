import { z } from 'zod'

const NEIGHBORHOODS = [
  'Qendra',
  'Dardania',
  'Dragodan',
  'Ulpiana',
  'Bregu i Diellit',
  'Lakrishte',
  'Kalabria',
  'Arberia',
  'Mati 1',
  'Aktash',
  'Taslixhe',
  'Veternik',
  'Sunny Hill',
  'Tophane',
] as const

const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'penthouse',
  'studio',
  'land',
  'commercial',
  'office',
] as const

const LISTING_TYPES = ['sale', 'rent'] as const

const CONDITIONS = [
  'new',
  'excellent',
  'good',
  'needs_renovation',
  'under_construction',
] as const

const ORIENTATIONS = [
  'north',
  'south',
  'east',
  'west',
  'north_east',
  'north_west',
  'south_east',
  'south_west',
] as const

const FURNISHED_TYPES = [
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
] as const

const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F'] as const

export const propertySubmitSchema = z.object({
  // ═══════════════════════════════════════════════════════════
  // BASIC INFO
  // ═══════════════════════════════════════════════════════════
  title: z
    .string()
    .min(10, 'Titulli duhet të ketë së paku 10 karaktere')
    .max(100, 'Titulli nuk mund të ketë më shumë se 100 karaktere'),

  description: z
    .string()
    .min(50, 'Përshkrimi duhet të ketë së paku 50 karaktere')
    .max(2000, 'Përshkrimi nuk mund të ketë më shumë se 2000 karaktere')
    .refine(
      (val) => !/https?:\/\//.test(val),
      'Nuk lejohen linke në përshkrim'
    ),

  price: z
    .number()
    .positive('Çmimi duhet të jetë pozitiv')
    .min(100, 'Çmimi minimal është 100')
    .max(10000000, 'Çmimi maksimal është 10,000,000'),

  listingType: z.enum(LISTING_TYPES),
  propertyType: z.enum(PROPERTY_TYPES),

  // ═══════════════════════════════════════════════════════════
  // LOCATION
  // ═══════════════════════════════════════════════════════════
  location: z.string().min(2, 'Adresa është e detyrueshme').max(200),
  city: z.string().min(2, 'Qyteti është i detyrueshëm').max(100),
  neighborhood: z.enum(NEIGHBORHOODS, {
    message: 'Zgjidh një lagje të vlefshme',
  }),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  distanceFromCenter: z.number().min(0).max(100).optional(),

  // ═══════════════════════════════════════════════════════════
  // CHARACTERISTICS
  // ═══════════════════════════════════════════════════════════
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  area: z.number().int().min(10).max(100000).optional(),
  balconies: z.number().int().min(0).max(10).optional(),
  floor: z.number().int().min(-2).max(50).optional(),
  totalFloors: z.number().int().min(1).max(100).optional(),
  yearBuilt: z.number().int().min(1900).max(2030).optional(),
  renovationYear: z.number().int().min(1900).max(2030).optional(),
  condition: z.enum(CONDITIONS).optional(),
  orientation: z.enum(ORIENTATIONS).optional(),
  furnished: z.enum(FURNISHED_TYPES).optional(),
  energyClass: z.enum(ENERGY_CLASSES).optional(),

  // ═══════════════════════════════════════════════════════════
  // FEATURES
  // ═══════════════════════════════════════════════════════════
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  hasHeating: z.boolean().optional(),
  hasSecurity: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  features: z.array(z.string()).max(20).optional(),

  // ═══════════════════════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════════════════════
  images: z
    .array(z.string())
    .min(3, 'Duhet të ngarkoni së paku 3 imazhe')
    .max(20, 'Maksimumi 20 imazhe'),

  // ═══════════════════════════════════════════════════════════
  // CONTACT
  // ═══════════════════════════════════════════════════════════
  contactPhone: z
    .string()
    .min(6, 'Telefoni duhet të ketë së paku 6 karaktere')
    .max(20, 'Telefoni nuk mund të ketë më shumë se 20 karaktere')
    .regex(/^[+\d\s()-]+$/, 'Format i pavlefshëm i telefonit'),

  contactEmail: z.string().email('Email i pavlefshëm'),
})

export type PropertySubmitInput = z.infer<typeof propertySubmitSchema>